'use babel';

/* @flow*/

import React from 'react';
import ReactDOM from 'react-dom';
import { CompositeDisposable } from 'atom';
import ReactTable from 'rc-table';

const columns = [{
  title: 'Name', dataIndex: 'name', key: 'name', width: 100,
}, {
  title: 'Age', dataIndex: 'age', key: 'age', width: 100,
}, {
  title: 'Address', dataIndex: 'address', key: 'address', width: 200,
}, {
  title: 'Apeartions', dataIndex: '', key: 'opeartions', render: () => <a href="#">Delete</a>,
}];

const data = [
  { name: 'Jack', age: 28, address: 'some where', key: '1' },
  { name: 'Rose', age: 36, address: 'some where', key: '2' },
];


export default class PanelView {
  subscriptions: CompositeDisposable;
  panel: any;
  element: any;

  constructor() {
    this.element = document.createElement('div');
    this.panel = atom.workspace.addBottomPanel({
      item: this.element,
      visible: true,
      priority: 500,
    });
    this.subscriptions = new CompositeDisposable();

    ReactDOM.render(<ReactTable columns={columns} data={data} />, this.element);
    this.subscriptions.add(() => {
      this.panel.destroy();
    });
  }

  hide() {
    this.panel.destroy();
  }
  reset() {
    this.element.html('');
  }
  dispose() {
    this.subscriptions.dispose();
  }
}
