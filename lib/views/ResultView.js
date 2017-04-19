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
export default class ResultView {
  properties: {
    messages: Array<Message>;
    ansiToHtml: boolean;
    softWrap: ?boolean;
    runningTestersCount: number;
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

    const softWrapHandler = () => {
      this.update({ softWrap: this.refs.softWrap.checked });
    };
    this.refs.softWrap.addEventListener('click', softWrapHandler);
    this.disposables.add(new Disposable(() => { this.refs.softWrap.removeEventListener('click', softWrapHandler()); }));
  }

  render() {
    const failedTests = this.properties.messages.filter(result => result.state === 'failed').length;
    const skippedTests = this.properties.messages.filter(result => result.state === 'skipped').length;
    const passedTests = this.properties.messages.filter(result => result.state === 'passed').length;
    return (
      <div class='tester-view'>

        <div class='tester-toolbar inline-block'>
            <span class={failedTests > 0 ? 'inline-block text-error' : 'inline-block'}>Failed: {failedTests}</span>
            <span class={skippedTests > 0 ? 'inline-block text-warning' : 'inline-block'}>Skipped: {skippedTests}</span>
            <span class={passedTests > 0 ? 'inline-block text-success' : 'inline-block'}>Passed: {passedTests}</span>
          <div class='inline-block pull-right'>
            <label class='input-label inline-block-tight'>
              <input class='input-checkbox' ref='softWrap' type='checkbox' checked={this.properties.softWrap}/> Soft Wrap</label>
            <atom-text-editor mini class='atom-text-editor-sm mini inline-block-tight input-text' style='width: 250px; line-height: 1.3em;'
              ref='additionalArgs' placeholder='Additional args (not saved in settings)'></atom-text-editor>
            <button class={this.properties.runningTestersCount > 0 ?
              'inline-block-tight btn btn-sm tester-wait-button' :
              'inline-block-tight btn btn-sm'}
              title='Test Project'
              onclick={this.handleTestButtonClick.bind(this)} disabled={this.properties.runningTestersCount > 0}>Test Project</button>
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

          <div class='tester-messages-container'>
            <div class='tester-empty-container'
              style={this.properties.messages.length > 0 ? 'display: none;' : ''}>No tester messages</div>

          {this.properties.messages.map((message, index) =>
            <div class='tester-message-row inline-block'
              style={this.properties.softWrap ? '' : 'white-space: nowrap;'}
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
    if (this.properties.messages !== newProperties.messages ||
      this.properties.softWrap !== newProperties.softWrap) {
      if (newProperties.messages) {
        this.properties.messages = newProperties.messages;
      }
      if (typeof newProperties.softWrap === 'boolean') {
        this.properties.softWrap = newProperties.softWrap;
      }
      if (typeof newProperties.runningTestersCount === 'number') {
        this.properties.runningTestersCount = newProperties.runningTestersCount;
      }
      return etch.update(this);
    }
    return Promise.resolve();
  }

  async destroy() {
    await etch.destroy(this);
    this.disposables.dispose();
  }

  getTitle() {
    return 'Tester Results';
  }

  getIconName() {
    return 'beaker';
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

  getAdditionalArgs() {
    return this.refs.additionalArgs.value || '';
  }

  onTestButtonClick(callback : Function) : Disposable {
    return this.emitter.on('test-project-button-click', callback);
  }

  handleTestButtonClick():void {
    this.emitter.emit('test-project-button-click', this.getAdditionalArgs());
  }

  handleRowClick(selectedIndex: number): void {
    const message = this.properties.messages[selectedIndex];
    if (!message.filePath) {
      return;
    }
    atom.workspace.open(message.filePath, { initialLine: message.lineNumber });
  }
}
