'use babel';

/* @flow */

import { CompositeDisposable } from 'atom';
import Commands from './commands';
import EditorsRegistry from './editor-registry';
import TesterRegistry from './tester-registry';
import * as OutputViewManager from './output-view-manager';
/* flow-include
import type { Panel } from 'atom';
import type { State, Tester as TesterProvider } from './types'
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
  gutter: any;
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
    this.gutter = null;
    const self = this;

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

    this.registryTesters.onDidUpdateMessages(({ tester, editor, messages }) => {
      self.statusBarTile.testResults(messages);
      const message = messages[0];
      const item = document.createElement('span');
      item.className = `tester-gutter tester-highlight ${message.state}`;
      const marker = editor.getBuffer().markRange(message.range, { invalidate: 'inside' });
      this.gutter.decorateMarker(marker, {
        class: 'tester-row',
        item,
      });
      console.log('onDidUpdateMessages', { tester, editor, messages });
          // this.registryMessages.set({ tester, messages, buffer })
    });
    this.registryTesters.onDidBeginTesting(({ tester, editor, messages }) => {
      if (!this.gutter) {
        const position = atom.config.get('tester.gutterPosition');
        this.gutter = editor.addGutter({
          name: 'tester',
          priority: position === 'Left' ? -100 : 100,
        });
      }
      self.statusBarTile.testRunning();
      console.log('onDidBeginTesting', { tester, editor, messages });
          // this.registryUI.didBeginTesting(tester, filePath)
    });
    this.registryTesters.onDidFinishTesting(({ tester, editor, messages }) => {
      self.statusBarTile.testFinished();
      console.log('onDidFinishTesting', { tester, editor, messages });
          // this.registryUI.didFinishTesting(tester, filePath)
    });

    this.registryEditors.activate();

    setTimeout(() => {
            // NOTE: Atom triggers this on boot so wait a while
      if (!self.subscriptions.disposed) {
        self.subscriptions.add(atom.project.onDidChangePaths(() => {
          self.commands.test();
        }));
      }
    }, 100);
  }

  createStatusBar(statusBar/* : Object*/) {
    const div = document.createElement('div');
    div.classList.add('inline-block');
    const statusSpan = document.createElement('span');
    statusSpan.textContent = '0 tests';
    const statusTiny = document.createElement('span');
    statusTiny.textContent = '';
    statusTiny.className = 'tester-tiny loading loading-spinner-tiny inline-block';
    statusTiny.style.display = 'none';
    const button = document.createElement('div');
    button.appendChild(statusSpan);
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

    statusBarTile.statusSpan = statusSpan;
    statusBarTile.testRunning = function () {
      console.log('---> statusBarTile.testRunning', statusSpan);
      statusTiny.style.display = 'inline-block';
    };
    statusBarTile.testFinished = function () {
      console.log('---> statusBarTile.testFinished', statusSpan);
      statusTiny.style.display = 'none';
    };

    statusBarTile.testResults = function (results) {
      console.log('---> statusBarTile.testResults', statusSpan, results);
      OutputViewManager.getView().setContent(JSON.stringify(results, null, 2));
      if (!results) {
        statusSpan.textContent = '0 tests';
      } else {
        statusSpan.textContent = `${results.length} tests`;
      }
    };
    this.statusBarTile = statusBarTile;
  }

  dispose() {
    if (this.gutter !== null) {
      try {
          // Atom throws when we try to remove a gutter container from a closed text editor
        this.gutter.destroy();
      } catch (err) {}
      this.gutter = null;
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
