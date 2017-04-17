'use babel';

/* @flow */

import { Disposable, CompositeDisposable } from 'atom';
import type { Panel } from 'atom';
import Commands from './commands';
import EditorsRegistry from './editor-registry';
import TesterRegistry from './tester-registry';
import { clearInlineMessages, decorateGutter, setInlineMessages } from './decorate-manager';
import ConsoleOutputView from './views/ConsoleOutputView';
import ResultView from './views/ResultView';
import StatusBar from './views/StatusBar';
import type { State, Tester as TesterProvider, Message } from './types';

// TODO
// - add run project tests command
class Tester {
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
  panel: ?ConsoleOutputView;
  resultView: ?ResultView;
  messages:Array<Message>;
  output: string;
  testerStatusBar: Object;

  constructor(state : State) {
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
    this.messages = [];
    this.output = 'Nothing new to show';
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
    this.subscriptions.add(atom.workspace.observeTextEditors((/* editor*/) => {
      if (self.statusBarTile) {
        self.statusBarTile.update({
          messages: self.messages,
          runningTestersCount: self.runningTestersCount,
        });
      }
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((/* paneItem*/) => {
      if (self.statusBarTile) {
        self.statusBarTile.update({
          messages: self.messages,
          runningTestersCount: self.runningTestersCount,
        });
      }
    }));

    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (item instanceof ConsoleOutputView) {
          item.destroy();
        }
      });
    }));

    this.subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === 'atom://tester-console-output') {
        self.panel = new ConsoleOutputView({
          output: this.output,
          ansiToHtml: this.ansiToHtml,
          scrollToBottom: this.scrollToBottom });
        return self.panel;
      }
    }));

    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (item instanceof ResultView) {
          item.destroy();
        }
      });
    }));

    this.subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === 'atom://tester-result-view') {
        self.resultView = new ResultView({
          messages: self.messages,
        });
        self.resultView.onTestButtonClick(async (shouldTestCurrentProject :?boolean) => {
          console.log('onTestButtonClick', this);
          self.registryTesters.test(this, shouldTestCurrentProject);
        });
        return self.resultView;
      }
    }));

    this.commands.onShouldTest(async (shouldTestCurrentProject :?boolean) => {
      const activeItem = atom.workspace.getActiveTextEditor() || atom.workspace.getActivePaneItem();
      const editorTester = this.registryEditors.get(activeItem);
      if (editorTester) {
        if (this.statusBarTile) {
          await this.statusBarTile.update({
            messages: this.messages,
            runningTestersCount: this.runningTestersCount,
          });
        }
        editorTester.test(shouldTestCurrentProject);
      }
    });

    this.commands.onShouldStop(() => {
      const editorTester = self.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorTester) {
        editorTester.stop();
      }
    });

    this.commands.onShouldToggleTesterOutput(() => {
      this.togglePanel();
    });
    this.commands.onShouldToggleTesterResultView(() => {
      this.toggleResultView();
    });

    this.registryEditors.observe((editorTester) => {
      editorTester.onShouldTest((shouldTestCurrentProject) => {
        self.registryTesters.test(editorTester, shouldTestCurrentProject);
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

    this.registryTesters.onDidUpdateMessages(async ({ editor, messages, output, shouldTestCurrentProject }) => {
      messages.forEach((message, index) => {
        if (!message || typeof message !== 'object') {
          messages.splice(index, 1);
          console.warn('Tester: Message is not valid. Remove it from globals.', message);
        }
      });
      this.messages = messages;
      this.output = output;
      await self.statusBarTile.update({
        messages: this.messages,
        runningTestersCount: this.runningTestersCount,
        editor,
      });
      if (this.panel) {
        await this.panel.update({ output });
      }
      if (this.resultView) {
        await this.resultView.update({ messages });
      }

      const gutter = self.registryEditors.handleGutter(editor);
      if (!gutter) {
        return;
      }
      clearInlineMessages(editor);
      if (!shouldTestCurrentProject) {
        decorateGutter(editor, gutter, messages);
        if (this.showInlineError) {
          setInlineMessages(editor, messages, this.ansiToHtml, this.inlineErrorPosition);
        }
      }
    });

    this.registryTesters.onDidBeginTesting(async () => {
      this.runningTestersCount += 1;
      if (self.statusBarTile) {
        await self.statusBarTile.update({
          messages: this.messages,
          runningTestersCount: this.runningTestersCount,
        });
      }
    });

    this.registryTesters.onDidFinishTesting(async () => {
      self.runningTestersCount -= 1;
      if (self.statusBarTile) {
        await self.statusBarTile.update({
          messages: this.messages,
          runningTestersCount: this.runningTestersCount,
        });
      }
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

  createStatusBar(statusBar : Object) {
    const onclick = () => {
      this.togglePanel();
      this.toggleResultView();
    };
    this.statusBarTile = new StatusBar({
      messages: this.messages,
      runningTestersCount: this.runningTestersCount,
      onclick,
    });

    atom.tooltips.add(this.statusBarTile.element, {
      title: 'failed | skipped | passed <br/>Click to toggle the tester console output view.',
    });

    statusBar.addLeftTile({
      item: this.statusBarTile.element,
      priority: -50,
    });
  }

  togglePanel() {
    atom.workspace.toggle('atom://tester-console-output');
  }

  toggleResultView() {
    atom.workspace.toggle('atom://tester-result-view');
  }

  async dispose() {
    if (this.statusBarTile) {
      await this.statusBarTile.destroy();
    }
    if (this.panel) {
      await this.panel.destroy();
    }
    if (this.resultView) {
      await this.resultView.destroy();
    }
    this.subscriptions.dispose();
  }

  addTester(tester : TesterProvider) {
    this.registryTesters.addTester(tester);
  }

  deleteTester(tester : TesterProvider) {
    this.registryTesters.deleteTester(tester);
  }
}

module.exports = Tester;
