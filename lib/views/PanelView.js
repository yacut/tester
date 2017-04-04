'use babel';

/* @flow*/

import React from 'react';
import ReactDOM from 'react-dom';
import { CompositeDisposable } from 'atom';

export default class PanelView {
  subscriptions: CompositeDisposable;

  constructor() {
    const element = document.createElement('div');
    const panel = atom.workspace.addBottomPanel({
      item: element,
      visible: true,
      priority: 500,
    });
    this.subscriptions = new CompositeDisposable();

    ReactDOM.render(<div>TESTER</div>, element);
    this.subscriptions.add(() => {
      panel.destroy();
    });
  }

  dispose() {
    this.subscriptions.dispose();
  }
}
