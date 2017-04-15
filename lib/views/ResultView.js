'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable } from 'atom';
import MessageView from './MessageView';
import type { Message } from '../types';

export default class ResultView {
  properties: {
    messages: Array<Message>;
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


    this.refs.messages.innerHTML = properties.messages.toString();
    this.panel = atom.workspace.addBottomPanel({
      item: this.element,
      visible: true,
      priority: 500,
    });

    const clearHandler = () => {
      this.update({ messages: [] });
    };
    this.refs.clearButton.addEventListener('click', clearHandler);
    this.disposables.add(new Disposable(() => { this.refs.clearButton.removeEventListener('click', clearHandler); }));

    const closeHandler = () => {
      this.close();
    };
    this.refs.closeButton.addEventListener('click', closeHandler);
    this.disposables.add(new Disposable(() => { this.refs.closeButton.removeEventListener('click', closeHandler); }));
  }

  render() {
    return (
      <div class='tester-output-view'>
        <div class='tester-resize-handle' ref='resizer'/>
        <div class='tester-panel-head block highlight'>
          <div class='tester-panel-title inline-block icon icon-terminal' style='cursor: default;'>Tester Results</div>
          <div class='tester-panel-buttons btn-toolbar inline-block pull-right'>
            <div class='tester-panel-clear inline-block icon-circle-slash' ref='clearButton' title='Clear Output'/>
            <div class='tester-panel-close inline-block icon-x' ref='closeButton' title='Close'/>
          </div>
        </div>
        <ul class='messages' ref='messages' messages={this.properties.messages}>
          {this.properties.messages.map(message => new MessageView({ ...message }))}
        </ul>
      </div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.messages !== newProperties.messages) {
      this.properties.messages = newProperties.messages;
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
