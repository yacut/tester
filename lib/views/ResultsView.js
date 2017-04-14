'use babel';

/* @flow*/

import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import ReactTable from 'rc-table'; // eslint-disable-line no-unused-vars
import { BehaviorSubject, Observable } from 'rxjs';
import { CompositeDisposable } from 'atom';
import type { Message } from '../types';

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

type PanelProps = {
  messages: Array<Message>
};

function getPropsStream(
  messagesStream: Observable<Array<Message>>,
): Observable<PanelProps> {
  const activeTextEditorPaths = Observable.create((observer) => {
    const disposable = atom.workspace.observeActivePaneItem.bind(atom.workspace)(observer.next.bind(observer));
    return () => { disposable.dispose(); };
  })
    .map((paneItem) => {
      if (atom.workspace.isTextEditor(paneItem)) {
        const textEditor: any = (paneItem: any);
        return textEditor ? textEditor.getPath() : null;
      }
      return null;
    })
    .distinctUntilChanged();

  return Observable.combineLatest(
    activeTextEditorPaths,
    messagesStream,
  )
    .map(([pathToActiveTextEditor, messages]) => ({
      pathToActiveTextEditor,
      messages,
    }));
}

export function toggle<T>(
  source: Observable<T>,
  toggler: Observable<boolean>,
): Observable<T> {
  return toggler
    .distinctUntilChanged()
    .switchMap(enabled => (enabled ? source : Observable.empty()));
}

export default class PanelView {
  _panel: any;
  _element: any;
  _visibility: BehaviorSubject<boolean>;
  _visibilitySubscription: any;
  _props: Observable<PanelProps>;
  _subscriptions: CompositeDisposable;

  constructor(messages: Observable<Array<Message>>) {
    this._element = document.createElement('div');
    this._panel = atom.workspace.addBottomPanel({
      item: this._element,
      visible: true,
      priority: 500,
    });
    this._subscriptions = new CompositeDisposable();
    this._subscriptions.add(() => {
      this._panel.destroy();
    });

    this._visibility = new BehaviorSubject(true);

    this._visibilitySubscription = this._visibility
      .debounceTime(1000)
      .distinctUntilChanged()
      .filter(Boolean)
      .subscribe();

    this._props = toggle(
      getPropsStream(
        messages,
      )
        .publishReplay(1)
        .refCount(),
      this._visibility.distinctUntilChanged(),
    );

    ReactDOM.render(
      <ReactTable
        columns={columns}
        data={data}
      />,
    this._element);
  }

  destroy(): void {
    this._visibilitySubscription.unsubscribe();
  }

  update(messages: Array<Message>) {
    console.log('update panel', messages);
  }

  hide() {
    this.destroy();
  }
  reset() {
    this._element.html('');
  }
  dispose() {
    this._subscriptions.dispose();
  }
  didChangeVisibility(visible: boolean): void {
    this._visibility.next(visible);
  }
}