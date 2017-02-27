'use babel'
/* @flow */

import {CompositeDisposable, Panel} from 'atom'
import Commands from './commands'
import EditorsRegistry from './editor-registry'
import TesterRegistry from './tester-registry'
import type { State, Tester as TesterProvider } from './types'

class Tester {
    /*::
  state: any;
  commands: Commands;
  subscriptions: CompositeDisposable;
  modalPanel: Panel;
  registryTesters: TesterRegistry;
  registryEditors: EditorsRegistry;
  statusBarTile: Object;
  */

    constructor(state/*: State*/, statusBarTile/*: Object*/) {
        console.log('MAIN', state, statusBarTile);
        this.state = state;
        this.commands = new Commands();
        this.statusBarTile = statusBarTile;
        this.registryEditors = new EditorsRegistry()
        this.registryTesters = new TesterRegistry();
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(this.commands);
        this.subscriptions.add(this.registryEditors);
        this.subscriptions.add(this.registryTesters);
        self = this;

        this.commands.onShouldTest(() => {
            console.log("MAIN.onShouldTest",self.registryEditors);
            const editorTester = self.registryEditors.get(atom.workspace.getActiveTextEditor())
            console.log("MAIN.editorTester",editorTester);
            if (editorTester) {
              self.statusBarTile.testRunning();
              editorTester.test();
            }
        })

        this.commands.onShouldToggleActiveEditor(() => {
          const textEditor = atom.workspace.getActiveTextEditor()
          const editor = self.registryEditors.get(textEditor)
          if (editor) {
            editor.dispose()
          } else if (textEditor) {
            self.registryEditors.createFromTextEditor(textEditor)
          }
        })

        this.registryEditors.observe((editorTester) => {
            editorTester.onShouldTest((onChange) => {
              self.registryTesters.test(onChange, editorTester)
            })
            /*editorTester.onDidDestroy(() => {
              this.registryMessages.deleteByBuffer(editorTester.getEditor().getBuffer())
            })*/
        })

        this.registryTesters.onDidUpdateMessages(({ tester, messages, buffer }) => {
          self.statusBarTile.testResults('FINISHED');
          console.log('onDidUpdateMessages',{ tester, messages, buffer });
          //this.registryMessages.set({ tester, messages, buffer })
        })
        this.registryTesters.onDidBeginTesting(({ tester, filePath }) => {
          self.statusBarTile.testRunning();
          console.log('onDidBeginTesting',{ tester, filePath });
          //this.registryUI.didBeginTesting(tester, filePath)
        })
        this.registryTesters.onDidFinishTesting(({ tester, filePath }) => {
          self.statusBarTile.testResults('FINISHED');
          console.log('onDidFinishTesting',{ tester, filePath });
          //this.registryUI.didFinishTesting(tester, filePath)
        })

        this.registryEditors.activate()

        setTimeout(() => {
            // NOTE: Atom triggers this on boot so wait a while
            if (!self.subscriptions.disposed) {
              self.subscriptions.add(atom.project.onDidChangePaths(() => {
                self.commands.test()
              }))
            }
        }, 100)
    }

    dispose() {
        this.subscriptions.dispose();
    }

    addTester(tester/*: TesterProvider*/) {
        this.registryTesters.addTester(tester)
    }

    deleteTester(tester/*: TesterProvider*/) {
        this.registryTesters.deleteTester(tester)
    }
}

module.exports = Tester
