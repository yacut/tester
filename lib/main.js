'use babel';

/* @flow */

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
    console.log('MAIN', state);
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

    this.commands.onShouldTest(() => {
      console.log('MAIN.onShouldTest', self.registryEditors);
      const editorTester = self.registryEditors.get(atom.workspace.getActiveTextEditor());
      console.log('MAIN.editorTester', editorTester);
      if (editorTester) {
        self.statusBarTile.testRunning();
        editorTester.test();
      }
    });

    this.commands.onShouldToggleActiveEditor(() => {
      const textEditor = atom.workspace.getActiveTextEditor();
      const editor = self.registryEditors.get(textEditor);
      if (editor) {
        editor.dispose();
      } else if (textEditor) {
        self.registryEditors.createFromTextEditor(textEditor);
      }
    });

    this.registryEditors.observe((editorTester) => {
      editorTester.onShouldTest((onChange) => {
        self.registryTesters.test(onChange, editorTester);
      });
    });

    this.registryTesters.onDidUpdateMessages(({ tester, editor, messages, output }) => {
      console.log('onDidUpdateMessages', { tester, editor, messages, output });
      self.statusBarTile.testResults(messages);
      const gutter = self.registryEditors.handleGutter(editor);
      if (!gutter) {
        return;
      }
      this.decorateGutter(editor, gutter, messages);
      this.setOutput(output);
    });

    this.registryTesters.onDidBeginTesting(({ tester, editor, messages }) => {
      console.log('onDidBeginTesting', { tester, editor, messages });
      if (self.statusBarTile) {
        self.statusBarTile.testRunning();
      }
    });

    this.registryTesters.onDidFinishTesting(({ tester, editor, messages, output }) => {
      console.log('onDidFinishTesting', { tester, editor, messages, output });
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
    const div = document.createElement('div');
    div.classList.add('inline-block');
    const passedTestsSpan = document.createElement('span');
    passedTestsSpan.textContent = '0';
    passedTestsSpan.className = 'tester-bottom-status tester-status-passed highlight highlight-success';
    const failedTestsSpan = document.createElement('span');
    failedTestsSpan.textContent = '0';
    failedTestsSpan.className = 'tester-bottom-status tester-status-failed highlight highlight-error';
    const skippedTestsSpan = document.createElement('span');
    skippedTestsSpan.textContent = '0';
    skippedTestsSpan.className = 'tester-bottom-status tester-status-skipped highlight highlight-warning';
    const statusTiny = document.createElement('span');
    statusTiny.textContent = '';
    statusTiny.className = 'tester-bottom-status tester-tiny loading loading-spinner-tiny inline-block';
    statusTiny.style.visibility = 'hidden';
    const button = document.createElement('span');
    button.appendChild(failedTestsSpan);
    button.appendChild(skippedTestsSpan);
    button.appendChild(passedTestsSpan);
    button.appendChild(statusTiny);

    button.onclick = function linkOnClick(e) {
      OutputViewManager.getView().toggle();
      return console.log('Tester is here!', e);
    };

    atom.tooltips.add(div, {
      title: 'Toggle Tester Output Console',
    });

    div.appendChild(button);

    const statusBarTile = statusBar.addLeftTile({
      item: div,
      priority: 0,
    });

    statusBarTile.status = {};
    statusBarTile.status.passed = passedTestsSpan;
    statusBarTile.status.failed = failedTestsSpan;
    statusBarTile.status.skipped = skippedTestsSpan;
    statusBarTile.status.statusTiny = statusTiny;
    statusBarTile.testRunning = function () {
      console.log('---> statusBarTile.testRunning', statusBarTile.status);
      this.status.statusTiny.style.visibility = 'visible';
    };
    statusBarTile.testFinished = function () {
      console.log('---> statusBarTile.testFinished', statusBarTile.status);
      this.status.statusTiny.style.visibility = 'hidden';
      // statusTiny.className = 'icon icon-check text-success inline-block';
    };

    statusBarTile.testResults = function (results) {
      console.log('---> statusBarTile.testResults', statusBarTile.status, results);
      if (!results) {
        this.status.passed.textContent = '0';
        this.status.failed.textContent = '0';
        this.status.skipped.textContent = '0';
      } else {
        this.status.passed.textContent = results.filter(result => result.state === 'passed').length;
        this.status.failed.textContent = results.filter(result => result.state === 'failed').length;
        this.status.skipped.textContent = results.filter(result => result.state === 'skipped').length;
      }
    };
    this.statusBarTile = statusBarTile;
  }

  decorateGutter(editor/* :TextEditor*/, gutter/* :Gutter*/, messages/* : Array<Object>*/) {
    editor.getBuffer().getMarkers().forEach((marker) => {
      marker.destroy();
    });
    messages.forEach((message) => {
      const item = document.createElement('span');
      item.className = `tester-gutter tester-highlight ${message.state}`;
      // https://atom.io/docs/api/v1.14.4/TooltipManager#instance-add
      atom.tooltips.add(item, {
        title: JSON.stringify(message, null, 2),
        placement: 'right',
        delay: { show: 100, hide: 100 },
      });
      const marker = editor.getBuffer()
        .markRange([[message.lineNumber, 0], [message.lineNumber, 0]], { invalidate: 'inside' });
      gutter.decorateMarker(marker, {
        class: 'tester-row',
        item,
      });
    });
  }

  setOutput(output/* :string*/) {
    console.log('OutputViewManager.setContent', OutputViewManager, output);
    OutputViewManager.getView().setContent(output).finish();
  }

  dispose() {
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
