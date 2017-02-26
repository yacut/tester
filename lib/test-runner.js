'use babel';

import TestRunnerView from './test-runner-view';
import { CompositeDisposable } from 'atom';

export default {

  testRunnerView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.testRunnerView = new TestRunnerView(state.testRunnerViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.testRunnerView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'test-runner:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.testRunnerView.destroy();
  },

  serialize() {
    return {
      testRunnerViewState: this.testRunnerView.serialize()
    };
  },

  toggle() {
    console.log('TestRunner was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
