'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable } from 'atom';
import type { Message } from '../types';

export default class ResultView {
  properties: {
    message: Message;
  }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties:Object) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    etch.initialize(this);
  }

  render() {
    return (
      <div class='tester-message'>{this.properties.message.title}</div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.message !== newProperties.message) {
      this.refs.message = newProperties.message;
      return etch.update(this);
    }
    return Promise.resolve();
  }

  async destroy() {
    await etch.destroy(this);
  }

  close() {
    if (this.panel != null) {
      this.panel.destroy();
      this.panel = null;
    }
  }
}
