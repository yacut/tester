'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable, TextEditor } from 'atom';
import { normalizeString } from '../helpers';
import type { Message, TesterResultState } from '../types';

// TODO
// - resize columns
export default class ResultView {
  properties: {
    state: TesterResultState;
    ansiToHtml: boolean;
    softWrap: ?boolean;
 }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;
  sortKey: string;
  desc: boolean;
  currentTest: Message;

  constructor(properties:Object) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    if (!this.properties.messages) {
      this.properties.messages = [];
    }
    this.sortKey = '';
    this.desc = false;
    etch.initialize(this);

    this.refs.additionalArgs.element.setAttribute('tabindex', 0);

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
              <input class='input-checkbox' ref='softWrap' type='checkbox' checked={this.properties.softWrap}/> Soft Wrap</label>
            <div class='inline-block-tight' style='width: 200px; font-size: 0.8em;'>
              {etch.dom(TextEditor, {
                ref: 'additionalArgs',
                mini: true,
                placeholderText: 'Additional command line args',
              })}
            </div>
            <button class={this.properties.state.counter > 0 ?
              'inline-block-tight btn btn-sm tester-wait-button' :
              'inline-block-tight btn btn-sm'}
              title='Test Project'
              ref='testProject'
              onclick={this.handleTestButtonClick.bind(this)} disabled={this.properties.state.counter > 0}>Test Project</button>
          </div>
        </div>

        <div class='tester-messages' ref='messages' messages={messages}>
          <div class='tester-message-header inline-block'>
              <div class='tester-message-cell tester-header tester-message-state inline-block'
                onclick={this.handleSortByClick.bind(this, 'state')} >State<span class='sort-indicator' ref='header-state'></span></div>
              <div class='tester-message-cell tester-header tester-message-duration inline-block'
                onclick={this.handleSortByClick.bind(this, 'duration')}>Duration<span class='sort-indicator' ref='header-duration'></span></div>
              <div class='tester-message-cell tester-header tester-message-title inline-block'
                onclick={this.handleSortByClick.bind(this, 'title')}>Title<span class='sort-indicator' ref='header-title'></span></div>
              <div class='tester-message-cell tester-header tester-message-error inline-block'
                onclick={this.handleSortByClick.bind(this, 'error')}>Error<span class='sort-indicator' ref='header-error'></span></div>
              <div class='tester-message-cell tester-header tester-message-location inline-block'
                onclick={this.handleSortByClick.bind(this, 'filePath')}>Location<span class='sort-indicator' ref='header-filePath'></span></div>
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
                      <span innerHTML={normalizeString(message, this.properties.ansiToHtml)}></span>
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

  update(newState :TesterResultState, shouldUpdate :?boolean) {
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
    return this.refs.additionalArgs ? this.refs.additionalArgs.getText() : '';
  }

  onTestButtonClick(callback : Function) : Disposable {
    return this.emitter.on('test-project-button-click', callback);
  }

  goToNextTest() {
    if (!this.properties.messages || this.properties.messages.length === 0) {
      return;
    }
    if (!this.currentTest) {
      this.currentTest = this.properties.state.messages[0];
    } else {
      const index = this.properties.state.messages.indexOf(this.currentTest);
      if (index >= 0 && index < this.properties.state.messages.length - 1) {
        this.currentTest = this.properties.state.messages[index + 1];
      }
    }
    this.openTest(this.currentTest);
  }

  goToPreviousTest() {
    if (!this.properties.state.messages || this.properties.state.messages.length === 0) {
      return;
    }
    if (!this.currentTest) {
      this.currentTest = this.properties.state.messages[this.properties.state.messages.length - 1];
    } else {
      const index = this.properties.state.messages.indexOf(this.currentTest);
      if (index > 0 && index <= this.properties.state.messages.length - 1) {
        this.currentTest = this.properties.state.messages[index - 1];
      }
    }
    this.openTest(this.currentTest);
  }

  openTest(message: Message) {
    if (!message || !message.filePath) {
      return;
    }
    atom.workspace.open(message.filePath, { initialLine: message.lineNumber });
  }

  handleTestButtonClick():void {
    this.emitter.emit('test-project-button-click', this.getAdditionalArgs());
  }

  handleRowClick(selectedIndex: number): void {
    if (!this.properties.state.messages || this.properties.state.messages.constructor !== Array) {
      return;
    }
    const message = this.properties.state.messages[selectedIndex];
    this.currentTest = message;
    this.openTest(message);
  }

  async handleSortByClick(key: string) {
    if (!this.properties.state.messages || this.properties.state.messages.length === 0) {
      return;
    }
    const ref = `header-${key}`;
    const headerElement = this.refs[ref];
    const desc = headerElement.className.includes('asc');

    this.refs['header-state'].classList.remove('asc', 'desc', 'icon-triangle-up', 'icon-triangle-down');
    this.refs['header-duration'].classList.remove('asc', 'desc', 'icon-triangle-up', 'icon-triangle-down');
    this.refs['header-title'].classList.remove('asc', 'desc', 'icon-triangle-up', 'icon-triangle-down');
    this.refs['header-error'].classList.remove('asc', 'desc', 'icon-triangle-up', 'icon-triangle-down');
    this.refs['header-filePath'].classList.remove('asc', 'desc', 'icon-triangle-up', 'icon-triangle-down');

    this.sortKey = key;
    this.desc = desc;
    this.sortMessages(this.sortKey, this.desc);
    if (desc) {
      headerElement.classList.add('desc', 'icon', 'icon-triangle-down');
    } else {
      headerElement.classList.add('asc', 'icon', 'icon-triangle-up');
    }
    await etch.update(this);
  }

  sortMessages(key: string, desc: boolean) {
    if (!this.properties.state.messages || this.properties.state.messages.constructor !== Array) {
      return;
    }
    this.properties.state.messages.sort((current, next) => {
      const currentValue = (key === 'error') ? (current.error ? current.error.message : '') : current[key];
      const nextValue = (key === 'error') ? (next.error ? next.error.message : '') : next[key];

      if (currentValue < nextValue) {
        return desc ? 1 : -1;
      }
      if (currentValue > nextValue) {
        return desc ? -1 : 1;
      }
      return 0;
    });
  }
}
