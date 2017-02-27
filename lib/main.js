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
  */

    constructor(state/*: State*/) {
        this.state = state
        this.commands = new Commands()

        this.registryEditors = new EditorsRegistry()
        this.registryTesters = new TesterRegistry();
        console.log('MAIN', state);
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(this.commands);

        this.commands.onShouldTest(() => {
            const editorTester = this.registryEditors.get(atom.workspace.getActiveTextEditor())
            if (editorTester) {
              editorTester.test()
            }
        })
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
