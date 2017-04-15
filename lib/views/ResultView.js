'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable } from 'atom';
import { normalizeString } from '../helpers';
import type { Message } from '../types';

// TODO
// - sort data by column head
// - resize column
// - scroll up/down/left/right
// - left border if cell empty
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
        <div class='tester-panel-header block highlight'>
          <div class='tester-panel-title inline-block icon icon-law' style='cursor: default;'>Tester Results</div>
          <div class='tester-panel-buttons btn-toolbar inline-block pull-right'>
            <div class='tester-panel-clear inline-block icon-circle-slash' ref='clearButton' title='Clear Output'/>
            <div class='tester-panel-close inline-block icon-x' ref='closeButton' title='Close'/>
          </div>
        </div>

        <div class="tester-toolbar inline-block">
            <span class="inline-block text-error">Failed: {this.properties.messages.filter(result => result.state === 'failed').length}</span>
            <span class="inline-block text-warning">Skipped: {this.properties.messages.filter(result => result.state === 'skipped').length}</span>
            <span class="inline-block text-success">Passed: {this.properties.messages.filter(result => result.state === 'passed').length}</span>
          <div class="inline-block pull-right">
            <label class='input-label'><input class='input-checkbox' type='checkbox' checked/> Checkbox</label>
            <button class="inline-block btn btn-sm" title="Open console">Console</button>
          </div>
        </div>

        <div class='tester-messages' ref='messages' messages={this.properties.messages}>
          <div class='tester-message-header inline-block'>
              <div class='tester-message-cell tester-header tester-message-state inline-block'>State</div>
              <div class='tester-message-cell tester-header tester-message-duration inline-block'>Duration</div>
              <div class='tester-message-cell tester-header tester-message-title inline-block'>Title</div>
              <div class='tester-message-cell tester-header tester-message-error inline-block'>Error</div>
              <div class='tester-message-cell tester-header tester-message-location inline-block'>Location</div>
          </div>

          {/* {this.properties.messages.length === 0 &&
            <div class='tester-empty-container'>No tester messages</div>
          } */}
          {this.properties.messages.map((message, index) =>
            <div class='tester-message-row inline-block' onclick={this.handleRowClick.bind(this, index)}>
                    <div class='tester-message-cell tester-message-state inline-block'>
                      <span class={
                        message.state === 'failed' ?
                        'highlight-error' : message.state === 'skipped' ?
                        'highlight-warning' : message.state === 'passed' ?
                        'highlight-success' : 'unknown'
                      }>{message.state || 'unknown'}</span>
                    </div>
                    <div class='tester-message-cell tester-message-duration inline-block'>{message.duration || 0}ms</div>
                    <div class='tester-message-cell tester-message-title inline-block'>{message.title || ''}</div>
                    <div class='tester-message-cell tester-message-error inline-block'><span innerHTML={normalizeString(message)}></span></div>
                    <div class='tester-message-cell tester-message-location inline-block' ref='tester-message-location'>
                      {message.filePath || ''}:{message.lineNumber.toString() || ''}
                    </div>
              </div>)}
        </div>
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

  handleRowClick(selectedIndex: number): void {
    const message = this.properties.messages[selectedIndex];
    console.log('onClick', message);
    atom.workspace.open(message.filePath, { initialLine: message.lineNumber });
  }
}
