'use babel';

/* @flow */

import { $ } from 'atom-space-pen-views';
import { CompositeDisposable } from 'atom';
import Commands from './commands';
import EditorsRegistry from './editor-registry';
import TesterRegistry from './tester-registry';
import * as OutputViewManager from './output-view-manager';
import { clearInlineMessages, decorateGutter, setInlineMessages } from './decorate-manager';
/* flow-include
import type { Panel, TextEditor } from 'atom';
import type { State, Tester as TesterProvider, Gutter } from './types'
*/
class Tester {
    /* ::
  state: any;
  commands: Commands;
  subscriptions: CompositeDisposable;
  modalPanel: Panel;
  registryTesters: TesterRegistry;
  registryEditors: EditorsRegistry;
  statusBarTile: Object;
  markers: Array<Object>;
  showInlineError: boolean;
  inlineErrorPosition: string;
  ansiToHtml: boolean;
  showOutputAfterTestRun: boolean;
  showNotifications: boolean;
  messageTimeout: number;
  runningTestersCount: number;
  scrollToBottom: boolean;
  */

  constructor(state/* : State*/) {
    this.state = state;
    this.commands = new Commands();
    this.registryEditors = new EditorsRegistry();
    this.registryTesters = new TesterRegistry();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.registryEditors);
    this.subscriptions.add(this.registryTesters);
    this.markers = [];
    this.showInlineError = true;
    this.inlineErrorPosition = 'after';
    this.ansiToHtml = true;
    this.showOutputAfterTestRun = true;
    this.showNotifications = true;
    this.messageTimeout = 5;
    this.runningTestersCount = 0;
    this.scrollToBottom = true;
    const self = this;

    this.subscriptions.add(atom.config.observe('tester.gutterEnabled', (gutterEnabled) => {
      this.registryEditors.gutterEnabled = gutterEnabled;
    }));
    this.subscriptions.add(atom.config.observe('tester.showInlineError', (showInlineError) => {
      this.showInlineError = showInlineError;
    }));
    this.subscriptions.add(atom.config.observe('tester.inlineErrorPosition', (inlineErrorPosition) => {
      this.inlineErrorPosition = inlineErrorPosition;
    }));
    this.subscriptions.add(atom.config.observe('tester.ansiToHtml', (ansiToHtml) => {
      this.ansiToHtml = ansiToHtml;
    }));
    this.subscriptions.add(atom.config.observe('tester.showOutputAfterTestRun', (showOutputAfterTestRun) => {
      this.showOutputAfterTestRun = showOutputAfterTestRun;
    }));
    this.subscriptions.add(atom.config.observe('tester.messageTimeout', (messageTimeout) => {
      this.messageTimeout = messageTimeout;
    }));
    this.subscriptions.add(atom.config.observe('tester.showNotifications', (showNotifications) => {
      this.showNotifications = showNotifications;
    }));
    this.subscriptions.add(atom.config.observe('tester.scrollToBottom', (scrollToBottom) => {
      this.scrollToBottom = scrollToBottom;
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors((editor) => {
      if (self.statusBarTile) {
        self.statusBarTile.resetResults(editor);
      }
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((paneItem) => {
      const isTextEditor = atom.workspace.isTextEditor(paneItem);
      if (self.statusBarTile && isTextEditor) {
        $('.status-bar-tester').show();
        self.statusBarTile.resetResults(paneItem);
      } else {
        $('.status-bar-tester').hide();
      }
    }));

    this.commands.onShouldTest(() => {
      const editorTester = self.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorTester) {
        if (self.statusBarTile) {
          self.statusBarTile.testRunning();
          OutputViewManager.getView().addClass('loading');
          self.statusBarTile.resetResults(atom.workspace.getActiveTextEditor());
        }
        editorTester.test();
      }
    });

    this.commands.onShouldStop(() => {
      const editorTester = self.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorTester) {
        editorTester.stop();
      }
    });

    this.commands.onShouldToggleTesterOutput(() => {
      OutputViewManager.getView().toggle();
    });

    this.registryEditors.observe((editorTester) => {
      editorTester.onShouldTest(() => {
        self.registryTesters.test(editorTester);
      });
      editorTester.onShouldTestAllOpened(() => {
        atom.workspace.getTextEditors().forEach((editor) => {
          const openedEditorTester = self.registryEditors.get(editor);
          if (openedEditorTester) {
            openedEditorTester.test();
          }
        });
      });
      editorTester.onShouldStop(() => {
        self.registryTesters.stop(editorTester);
      });
    });

    this.registryTesters.onDidUpdateMessages(({ editor, messages, output }) => {
      self.statusBarTile.setResults(editor, messages);
      const gutter = self.registryEditors.handleGutter(editor);
      if (!gutter) {
        return;
      }
      clearInlineMessages(editor);
      decorateGutter(editor, gutter, messages);
      if (this.showInlineError) {
        setInlineMessages(editor, messages, this.ansiToHtml, this.inlineErrorPosition);
      }
      this.setOutput(editor, output);
    });

    this.registryTesters.onDidBeginTesting(() => {
      if (self.statusBarTile) {
        self.statusBarTile.testRunning();
        OutputViewManager.getView().addClass('loading');
      }
      OutputViewManager.getView().clear();
    });

    this.registryTesters.onDidFinishTesting(() => {
      self.statusBarTile.testFinished();
      OutputViewManager.getView().removeClass('loading');
    });

    this.registryEditors.activate();

    setTimeout(() => {
      // NOTE: Atom triggers this on boot so wait a while
      if (!self.subscriptions.disposed) {
        self.subscriptions.add(atom.project.onDidChangePaths(() => {
          self.registryEditors.handleGutter();
          self.commands.test();
        }));
      }
    }, 100);
  }

  createStatusBar(statusBar/* : Object*/) {
    const self = this;
    const baseClasses = 'tester-bottom-status highlight';
    const div = $(document.createElement('div'))
      .addClass('status-bar-tester inline-block').hide();
    const passedTestsSpan = $(document.createElement('span')).text('0')
      .addClass(`${baseClasses} tester-status-passed`);
    const failedTestsSpan = $(document.createElement('span')).text('0')
      .addClass(`${baseClasses} tester-status-failed`);
    const skippedTestsSpan = $(document.createElement('span')).text('0')
      .addClass(`${baseClasses} tester-status-skipped`);
    const statusTiny = $(document.createElement('span')).text('')
      .addClass('tester-tiny loading loading-spinner-tiny inline-block idle');
    div.append(failedTestsSpan, skippedTestsSpan, passedTestsSpan, statusTiny)
      .on('click', () => {
        OutputViewManager.getView().toggle();
      });

    atom.tooltips.add(div, {
      title: 'failed | skipped | passed <br/>Click to toggle the tester console output view.',
    });

    const statusBarTile = statusBar.addLeftTile({
      item: div,
      priority: -50,
    });

    statusBarTile.status = {};
    statusBarTile.status.passed = passedTestsSpan;
    statusBarTile.status.failed = failedTestsSpan;
    statusBarTile.status.skipped = skippedTestsSpan;
    statusBarTile.status.statusTiny = statusTiny;
    statusBarTile.testRunning = function testRunning() {
      self.runningTestersCount += 1;
      this.status.statusTiny.removeClass('idle');
    };
    statusBarTile.testFinished = function testFinished() {
      self.runningTestersCount -= 1;
      if (!(self.runningTestersCount > 0)) {
        this.status.statusTiny.addClass('idle');
      }
    };

    statusBarTile.resetResults = function resetResults(editor) {
      if (editor && editor.testerLastResults) {
        this.setResults(editor, editor.testerLastResults);
      } else {
        this.status.passed.text('0').removeClass('highlight-success');
        this.status.failed.text('0').removeClass('highlight-error');
        this.status.skipped.text('0').removeClass('highlight-warning');
      }
    };

    statusBarTile.setResults = function setResults(editor, results) {
      if (editor && results) {
        editor.testerLastResults = results;
      }
      if (results && editor !== atom.workspace.getActiveTextEditor() && self.showNotifications) {
        const passedTests = results.filter(result => result.state === 'passed').length;
        const failedTests = results.filter(result => result.state === 'failed').length;
        const skippedTests = results.filter(result => result.state === 'skipped').length;
        const resultMessage = `<span class='tester-bottom-status highlight-error'>${failedTests} failed</span>
                               <span class='tester-bottom-status highlight-warning'>${skippedTests} skipped</span>
                               <span class='tester-bottom-status highlight-success'>${passedTests} passed</span>`;
        atom.notifications.addInfo(`<b>Tester:</b> Results for <b>${editor.getTitle()}</b><br/>${resultMessage}`, { icon: 'checklist' });
      }
      if (!results || editor !== atom.workspace.getActiveTextEditor()) {
        this.resetResults();
      } else {
        const passedTests = results.filter(result => result.state === 'passed').length;
        this.status.passed.text(passedTests);
        if (passedTests > 0) {
          this.status.passed.addClass('highlight-success');
        } else {
          this.status.passed.removeClass('highlight-success');
        }

        const failedTests = results.filter(result => result.state === 'failed').length;
        this.status.failed.text(failedTests);
        if (failedTests > 0) {
          this.status.failed.addClass('highlight-error');
        } else {
          this.status.failed.removeClass('highlight-error');
        }

        const skippedTests = results.filter(result => result.state === 'skipped').length;
        this.status.skipped.text(skippedTests);
        if (skippedTests > 0) {
          this.status.skipped.addClass('highlight-warning');
        } else {
          this.status.skipped.removeClass('highlight-warning');
        }
      }
    };
    this.statusBarTile = statusBarTile;
    $(this.statusBarTile.getItem()).show();
  }

  setOutput(editor/* : TextEditor*/, output/* :string*/) {
    OutputViewManager.getView().setContent(output, this.ansiToHtml).finish(this.showOutputAfterTestRun, this.messageTimeout, this.scrollToBottom);
  }

  dispose() {
    if (this.statusBarTile) {
      this.statusBarTile.destroy();
    }
    this.subscriptions.dispose();
  }

  addTester(tester/* : TesterProvider*/) {
    this.registryTesters.addTester(tester);
  }

  deleteTester(tester/* : TesterProvider*/) {
    this.registryTesters.deleteTester(tester);
  }
}

module.exports = Tester;
