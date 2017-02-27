'use babel'
/* @flow */

import { CompositeDisposable, Panel } from 'atom'
import TesterView from './tester-view';

class Tester {
  /*::
  state: any;
  subscriptions: CompositeDisposable;
  testerView: TesterView;
  modalPanel: Panel;
  */

  constructor(state/*: any*/) {
    this.state = state

    this.testerView = new TesterView(state.testerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.testerView.getElement(),
      visible: false
    });
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tester:toggle': () => this.toggle()
    }));
  }

  dispose() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.testerView.destroy();
  }

  serialize() {
    return {
      testerViewState: this.testerView.serialize()
    };
  }

  toggle() {
      console.log('Tester was toggled!');
      return (
        this.modalPanel.isVisible() ?
        this.modalPanel.hide() :
        this.modalPanel.show()
      );
    }
}

module.exports = Tester
