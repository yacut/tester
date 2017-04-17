'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable } from 'atom';
import type { Disposable } from 'atom';
import { normalizeString } from '../helpers';
import type { Message } from '../types';

// TODO
// - sort data by column head
// - resize column
// - only current file filter
// - soft wrap table
export default class ResultView {
  properties: {
    messages: Array<Message>;
    ansiToHtml: boolean;
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
      <div class='tester-output-view'>

        <div class="tester-toolbar inline-block">
            <span class="inline-block text-error">Failed: {this.properties.messages.filter(result => result.state === 'failed').length}</span>
            <span class="inline-block text-warning">Skipped: {this.properties.messages.filter(result => result.state === 'skipped').length}</span>
            <span class="inline-block text-success">Passed: {this.properties.messages.filter(result => result.state === 'passed').length}</span>
          <div class="inline-block pull-right">
            <label class='input-label inline-block-tight'><input class='input-checkbox' ref='softWrap' type='checkbox'/> Soft Wrap</label>
            <label class='input-label inline-block-tight'><input class='input-checkbox' type='checkbox'/> Current file only</label>
            <button class="inline-block-tight btn btn-sm" title="Test Project"
              onclick={this.handleTestButtonClick.bind(this, true)}>Test Project</button>
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

          <div class='tester-empty-container'
            style={this.properties.messages.length > 0 ? 'display: none;' : ''}>No tester messages</div>

          <div class='tester-messages-container'>
          {this.properties.messages.map((message, index) =>
            <div class='tester-message-row inline-block'
              style={this.refs.softWrap ? 'white-space: nowrap;' : ''}
              onclick={this.handleRowClick.bind(this, index)}>
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
                    <div class='tester-message-cell tester-message-error inline-block'>
                      <span innerHTML={normalizeString(message, this.properties.ansiToHtml)}></span>
                    </div>
                    <div class='tester-message-cell tester-message-location inline-block' ref='tester-message-location'>
                      {atom.project.relativizePath(message.filePath)[1] || message.filePath || ''}:{message.lineNumber.toString() || ''}
                    </div>
              </div>)}
          </div>
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

  getTitle() {
    return 'Tester results';
  }

  getIconName() {
    return 'law';
  }

  getDefaultLocation() {
    return 'bottom';
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    return 'atom://tester-result-view';
  }

  getPath() {
    return 'atom://tester-result-view';
  }

  getElement() {
    return this.element;
  }

  onTestButtonClick(callback : Function) : Disposable {
    return this.emitter.on('test-button-click', callback);
  }

  handleRowClick(selectedIndex: number): void {
    const message = this.properties.messages[selectedIndex];
    atom.workspace.open(message.filePath, { initialLine: message.lineNumber });
  }

  handleTestButtonClick(shouldTestCurrentProject :boolean):void {
    console.log('handleTestButtonClick', shouldTestCurrentProject);
    this.emitter.emit('test-button-click', shouldTestCurrentProject);
  }
}
