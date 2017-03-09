'use babel';

/* @flow */

import { $ } from 'atom-space-pen-views';
import _ from 'lodash';
import { CompositeDisposable } from 'atom';
import Commands from './commands';
import EditorsRegistry from './editor-registry';
import TesterRegistry from './tester-registry';
import * as OutputViewManager from './output-view-manager';
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
    const self = this;

    this.subscriptions.add(atom.config.observe('tester.gutterEnabled', (gutterEnabled) => {
      this.registryEditors.gutterEnabled = gutterEnabled;
    }));
    this.subscriptions.add(atom.workspace.observeTextEditors(() => {
      if (self.statusBarTile) {
        self.statusBarTile.resetResults();
      }
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(() => {
      if (self.statusBarTile) {
        self.statusBarTile.resetResults();
      }
    }));

    this.commands.onShouldTest(() => {
      const editorTester = self.registryEditors.get(atom.workspace.getActiveTextEditor());
      if (editorTester) {
        if (self.statusBarTile) {
          self.statusBarTile.testRunning();
          self.statusBarTile.resetResults();
        }
        editorTester.test();
      }
    });

    this.commands.onShouldStop(() => {
      this.registryTesters.stop();
    });

    this.commands.onShouldToggleTesterOutput(() => {
      OutputViewManager.getView().toggle();
    });

    this.registryEditors.observe((editorTester) => {
      editorTester.onShouldTest(() => {
        self.registryTesters.test(editorTester);
      });
    });

    this.registryTesters.onShouldTriggerTester((/* { shouldTriggerTester }*/) => {

    });

    this.registryTesters.onDidUpdateMessages(({ editor, messages, output }) => {
      self.statusBarTile.testResults(messages);
      const gutter = self.registryEditors.handleGutter(editor);
      if (!gutter) {
        return;
      }
      this.decorateGutter(editor, gutter, messages);
      this.setOutput(output);
    });

    this.registryTesters.onDidBeginTesting(() => {
      if (self.statusBarTile) {
        self.statusBarTile.testRunning();
      }
      OutputViewManager.getView().clear();
    });

    this.registryTesters.onDidFinishTesting(() => {
      self.statusBarTile.testFinished();
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
      .addClass('tester-bottom-status tester-tiny loading loading-spinner-tiny inline-block').hide();
    const button = $(document.createElement('span'))
      .append(failedTestsSpan, skippedTestsSpan, passedTestsSpan, statusTiny)
      .on('click', () => {
        OutputViewManager.getView().toggle();
      });

    atom.tooltips.add(div, {
      title: 'failed | skipped | passed <br/>Click to toggle the tester console output view.',
    });

    div.append(button);

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
      this.status.statusTiny.show();
    };
    statusBarTile.testFinished = function testFinished() {
      this.status.statusTiny.hide();
      // statusTiny.className = 'icon icon-check text-success inline-block';
    };

    statusBarTile.resetResults = function resetResults() {
      this.status.passed.text('0').removeClass('highlight-success');
      this.status.failed.text('0').removeClass('highlight-error');
      this.status.skipped.text('0').removeClass('highlight-warning');
    };

    statusBarTile.testResults = function testResults(results) {
      if (!results) {
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

  decorateGutter(editor/* :TextEditor*/, gutter/* :Gutter*/, messages/* : Array<Object>*/) {
    editor.getBuffer().getMarkers().forEach((marker) => {
      marker.destroy();
    });
    _.forEach(messages, (message) => {
      const tooltipDuration = $(document.createElement('span')).text(`${message.duration}ms`).addClass('highlight-info');
      const tooltipTesterName = $(document.createElement('span')).text('Tester').addClass('highlight');
      const tooltipTesterState = $(document.createElement('span')).append(message.state);
      if (message.state === 'passed') {
        tooltipTesterState.addClass('highlight-success');
      } else if (message.state === 'failed') {
        tooltipTesterState.addClass('highlight-error');
      } else {
        tooltipTesterState.addClass('highlight-warning');
      }
      const tooltipTitle = $(document.createElement('span')).append(tooltipTesterName, tooltipTesterState, tooltipDuration).addClass('inline-block tester-tooltip-title');
      const tooltipError = $(document.createElement('div')).addClass('inline-block example-code show-example-html').text('');
      if (_.has(message.error, 'name')) {
        tooltipError.text(`${message.error.name}: ${message.error.message}`);
      }
      const tooltip = $(document.createElement('div')).append(tooltipTitle, tooltipError).addClass('example');
      const item = $(document.createElement('span')).addClass(`block tester-gutter tester-highlight ${message.state}`);
      // https://atom.io/docs/api/v1.14.4/TooltipManager#instance-add
      atom.tooltips.add(item.get(0), {
        item: tooltip.get(0),
        html: true,
        placement: 'right',
        delay: { show: 100, hide: 100 },
      });
      const marker = editor.getBuffer()
        .markRange([[message.lineNumber, 0], [message.lineNumber, 0]], { invalidate: 'inside' });
      gutter.decorateMarker(marker, {
        class: 'tester-row',
        item: item.get(0),
      });
    });
  }

  setOutput(output/* :string*/) {
    OutputViewManager.getView().setContent(output).finish();
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
