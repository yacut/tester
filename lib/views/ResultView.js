'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable, TextEditor } from 'atom';
import { normalizeString } from '../helpers';
import type { TesterState } from '../types';

// TODO
// - resize columns
// - move sort and filter to observable action
// - add 'current file' checkbox to filter messages
export default class ResultView {
  properties: {
    state: TesterState;
    softWrap: ?boolean;
    currentFileOnly: ?boolean;
 }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties: {
    state: TesterState,
    softWrap?: ?boolean,
    currentFileOnly?: ?boolean,
  }) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    etch.initialize(this);

    try {
      const additionalArgs = this.properties.state && this.properties.state.additionalArgs ? this.properties.state.additionalArgs : '';
      this.refs.additionalArgs.element.getModel().setText(additionalArgs);
    } catch (e) {
      console.error(e);
    }

    const softWrapHandler = async () => {
      this.properties.softWrap = this.refs.softWrap.checked;
      await this.update(this.properties.state, true);
    };
    this.refs.softWrap.addEventListener('click', softWrapHandler);
    this.disposables.add(new Disposable(() => { this.refs.softWrap.removeEventListener('click', softWrapHandler()); }));
  }

  render() {
    let messages = this.properties.state.messages;
    if (!messages || messages.constructor !== Array) {
      messages = [];
    }
    const sortKey = this.properties.state.sorter.key;
    const desc = this.properties.state.sorter.desc;

    const failedTests = messages.filter(result => result.state === 'failed').length;
    const skippedTests = messages.filter(result => result.state === 'skipped').length;
    const passedTests = messages.filter(result => result.state === 'passed').length;
    return (
      <div class='tester-view'>

        <div class='tester-toolbar inline-block'>
            <span ref='failed' class={failedTests > 0 ? 'inline-block text-error' : 'inline-block'}>Failed: {failedTests}</span>
            <span ref='skipped' class={skippedTests > 0 ? 'inline-block text-warning' : 'inline-block'}>Skipped: {skippedTests}</span>
            <span ref='passed' class={passedTests > 0 ? 'inline-block text-success' : 'inline-block'}>Passed: {passedTests}</span>
          <div class='inline-block pull-right'>
            <label class='input-label inline-block-tight'>
              <input class='input-checkbox' ref='currentFileOnly' type='checkbox'
                onclick={this.handleCurrentFileOnlyClick.bind(this, !this.properties.state.currentFileOnly)}
                checked={this.properties.state.currentFileOnly}/>Current file only
            </label>
            <label class='input-label inline-block-tight'>
              <input class='input-checkbox' ref='softWrap' type='checkbox' checked={this.properties.softWrap}/> Soft Wrap</label>
            <div class='inline-block-tight' style='width: 200px; font-size: 0.8em;'>
              {etch.dom(TextEditor, {
                ref: 'additionalArgs',
                mini: true,
                placeholderText: 'Additional command line args',
              })}
            </div>
            <button class={this.properties.state.testRunning ?
              'inline-block-tight btn btn-sm tester-wait-button' :
              'inline-block-tight btn btn-sm'}
              title='Test Project'
              ref='testProject'
              onclick={this.handleTestButtonClick.bind(this)} disabled={this.properties.state.testRunning}>Test Project</button>
            <button class='inline-block-tight btn btn-sm' title='Clear' ref='clear' onclick={this.handleClearButtonClick.bind(this)}>Clear</button>
          </div>
        </div>

        <div class='tester-messages' ref='messages' messages={messages}>
          <div class='tester-message-header inline-block'>
              <div class='tester-message-cell tester-header tester-message-state inline-block'
                onclick={this.handleSortByClick.bind(this, 'state')} >State
                <span class={`sort-indicator icon${sortKey === 'state' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-state'></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-duration inline-block'
                onclick={this.handleSortByClick.bind(this, 'duration')}>Duration
                <span class={`sort-indicator icon${sortKey === 'duration' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-duration'></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-title inline-block'
                onclick={this.handleSortByClick.bind(this, 'title')}>Title
                <span class={`sort-indicator icon${sortKey === 'title' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-title'></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-error inline-block'
                onclick={this.handleSortByClick.bind(this, 'error')}>Error
                <span class={`sort-indicator icon${sortKey === 'error' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-error'></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-location inline-block'
                onclick={this.handleSortByClick.bind(this, 'filePath')}>Location
                <span class={`sort-indicator icon${sortKey === 'filePath' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-filePath'></span>
              </div>
          </div>

          <div ref='messagesContainer' class='tester-messages-container'>
            <div ref='emptyContainer' class='tester-empty-container'
              style={messages.length > 0 ? 'display: none;' : ''}>No tester messages</div>

          {messages.map((message, index) =>
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
                      <span innerHTML={normalizeString(message)}></span>
                    </div>
                    <div class='tester-message-cell tester-message-location inline-block' ref='tester-message-location'>
                      {atom.project.relativizePath(message.filePath)[1] || message.filePath || ''}
                      {message.lineNumber ? `:${message.lineNumber + 1}` : ''}
                    </div>
              </div>)}
          </div>
        </div>
      </div>
    );
  }

  update(newState :TesterState, shouldUpdate :?boolean) {
    if (newState && this.properties.state !== newState) {
      this.properties.state = newState;
      return etch.update(this);
    }
    if (shouldUpdate) {
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

  getElement() {
    return this.element;
  }

  serialize() {
    return {
      deserializer: 'tester-result-view',
    };
  }

  getAdditionalArgs() {
    return this.refs.additionalArgs ? this.refs.additionalArgs.getText() : null;
  }

  onTestButtonClick(callback: Function) : Disposable {
    return this.emitter.on('test-project-button-click', callback);
  }

  onSortByClick(callback: Function) : Disposable {
    return this.emitter.on('sort-by-click', callback);
  }

  onCurrentFileOnlyClick(callback: Function) : Disposable {
    return this.emitter.on('current-file-only-click', callback);
  }

  onClearButtonClick(callback: Function) : Disposable {
    return this.emitter.on('clear-click', callback);
  }

  handleTestButtonClick(): void {
    this.emitter.emit('test-project-button-click', this.getAdditionalArgs());
  }

  handleRowClick(selectedIndex: number): void {
    if (!this.properties.state.messages || this.properties.state.messages.constructor !== Array) {
      return;
    }
    const message = this.properties.state.messages[selectedIndex];
    if (!message || !message.filePath) {
      return;
    }
    atom.workspace.open(message.filePath, { initialLine: message.lineNumber });
  }

  handleSortByClick(key: string): void {
    const ref = `header-${key}`;
    const headerElement = this.refs[ref];
    const desc = headerElement.className.includes('asc');
    this.emitter.emit('sort-by-click', { key, desc });
  }

  handleCurrentFileOnlyClick(currentFileOnly: boolean): void {
    this.emitter.emit('current-file-only-click', currentFileOnly);
  }

  handleClearButtonClick(): void {
    this.emitter.emit('clear-click');
  }
}
