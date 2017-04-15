'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable } from 'atom';
// import MessageView from './MessageView';
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

    this.panel = atom.workspace.addBottomPanel({
      item: this.element,
      visible: true,
      priority: 500,
    });

    const clearHandler = async () => {
      await this.update({ messages: [] });
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
        <div class='tester-messages' ref='messages' messages={this.properties.messages}>
          {this.properties.messages.map((message) => {
            console.log('message', message);
            return <div class="tester-message-row inline-block">
                    <span class="icon icon-info inline-block"></span>
                    <div class="tester-message-title inline-block">
                      {message.title}
                    </div>
                    <span class="tester-message-state inline-block highlight-info">{message.state}</span>
                    <div class="tester-message-filepath inline-block">{message.filePath}</div>
                    <div class="tester-message-linenumber inline-block">{message.lineNumber}</div>
                    <div class="tester-message-duration inline-block">{message.duration}</div>
              </div>;
          })}
        </div>
      </div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.messages !== newProperties.messages) {
      console.log('MESSAGES', newProperties.messages);
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
