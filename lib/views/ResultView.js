'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable, TextEditor } from 'atom';
import { normalizeString } from '../helpers';
import type { TesterState } from '../types';

type ColumnKey = string;
export type Column = {
  title: string,
  key: ColumnKey,
  width?: number,
}
type WidthMap = {
  [key: ColumnKey]: number,
};

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
  globalEventsDisposable: ?Disposable;
  resizeStartX: ?number;
  tableWidth: ?number;
  columnBeingResized: ?ColumnKey;
  columns: Array<Column>;
  columnWidthRatios: WidthMap;

  constructor(properties: {
    state: TesterState,
    softWrap?: ?boolean,
    currentFileOnly?: ?boolean,
  }) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    this.globalEventsDisposable = null;
    this.resizeStartX = null;
    this.tableWidth = null;
    this.columnBeingResized = null;
    (this: any)._handleResizerGlobalMouseUp = this.handleResizerGlobalMouseUp.bind(this);
    (this: any)._handleResizerGlobalMouseMove = this.handleResizerGlobalMouseMove.bind(this);
    this.columns = [
      { title: 'State', key: 'state', width: 0.03 },
      { title: 'Duration', key: 'duration', width: 0.05 },
      { title: 'Title', key: 'title', width: 0.3 },
      { title: 'Error', key: 'error', width: 0.5 },
      { title: 'Location', key: 'location', width: 0.12 },
    ];
    this.columnWidthRatios = this.getInitialWidthsForColumns(this.columns);

    etch.initialize(this);

    const additionalArgs = this.properties.state && this.properties.state.additionalArgs ? this.properties.state.additionalArgs : '';
    this.refs.additionalArgs.getBuffer().setText(additionalArgs);

    const additionalArgsChangeHandler = () => {
      this.emitter.emit('set-additional-args', this.refs.additionalArgs.getText());
    };
    this.refs.additionalArgs.getBuffer().onDidChange(additionalArgsChangeHandler);
    this.disposables.add(new Disposable(() => { this.refs.additionalArgs.element.removeEventListener('onChange', additionalArgsChangeHandler()); }));

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
    let totalMessages = this.properties.state.rawMessages;
    if (!totalMessages || totalMessages.constructor !== Array) {
      totalMessages = [];
    }
    const totalTime = (totalMessages.reduce((acc, message) => acc + (message.duration || 0), 0) / 1000).toFixed(2);
    const sortKey = this.properties.state.sorter.key;
    const desc = this.properties.state.sorter.desc;

    const failedTests = messages.filter(result => result.state === 'failed').length;
    const skippedTests = messages.filter(result => result.state === 'skipped').length;
    const passedTests = messages.filter(result => result.state === 'passed').length;
    const stateStyle = atom.config.get('tester.testStateStyle');

    return (
      <div class='tester-view'>

        <div class='tester-toolbar inline-block'>
            <span ref='failed' class={failedTests > 0 ? 'inline-block text-error' : 'inline-block'}>Failed: {failedTests}</span>
            <span ref='skipped' class={skippedTests > 0 ? 'inline-block text-warning' : 'inline-block'}>Skipped: {skippedTests}</span>
            <span ref='passed' class={passedTests > 0 ? 'inline-block text-success' : 'inline-block'}>Passed: {passedTests}</span>
            <span ref='total' class='inline-block'>Total: {totalMessages.length}</span>
            <span ref='totalTime' class='inline-block icon icon-clock'>{!isNaN(totalTime) ? totalTime : 0}s</span>
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
              'inline-block-tight btn btn-sm icon icon-rocket tester-wait-button' :
              'inline-block-tight btn btn-sm icon icon-rocket'}
              title='Test Project'
              ref='testProject'
              onclick={this.handleTestButtonClick.bind(this)}
              disabled={this.properties.state.testRunning}>Test Project</button>
            <button class='inline-block-tight btn btn-sm icon icon-trashcan'
              title='Clear'
              ref='clear'
              onclick={this.handleClearButtonClick.bind(this)}>Clear</button>
          </div>
        </div>

        <div class='tester-messages' ref='messages' messages={messages}>
          <div class='tester-message-header inline-block'>
              <div class={
                stateStyle === 'Icon' ?
                'tester-message-cell tester-header tester-message-state inline-block tester-message-state-icon' :
                'tester-message-cell tester-header tester-message-state inline-block'
              }
                onclick={this.handleSortByClick.bind(this, 'state')}
                style={`width: ${this.columnWidthRatios.state * 100}%`}>
                {stateStyle === 'Icon' ? <span class='icon icon-check'></span> : 'State'}
                <span class={`sort-indicator icon${sortKey === 'state' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-state'></span>
                <span class="tester-header-resizer" onMouseDown={this.handleResizerMouseDown.bind(this, 'state')}></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-duration inline-block'
                onclick={this.handleSortByClick.bind(this, 'duration')}
                style={`width: ${this.columnWidthRatios.duration * 100}%`}>Duration
                <span class={`sort-indicator icon${sortKey === 'duration' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-duration'></span>
                <span class="tester-header-resizer" onMouseDown={this.handleResizerMouseDown.bind(this, 'duration')}></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-title inline-block'
                onclick={this.handleSortByClick.bind(this, 'title')}
                style={`width: ${this.columnWidthRatios.title * 100}%`}>Title
                <span class={`sort-indicator icon${sortKey === 'title' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-title'></span>
                <span class="tester-header-resizer" onMouseDown={this.handleResizerMouseDown.bind(this, 'title')}></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-error inline-block'
                onclick={this.handleSortByClick.bind(this, 'error')}
                style={`width: ${this.columnWidthRatios.error * 100}%`}>Error
                <span class={`sort-indicator icon${sortKey === 'error' ? desc ? ' desc icon-triangle-down' : ' asc icon-triangle-up' : ''}`}
                  ref='header-error'></span>
                <span class="tester-header-resizer" onMouseDown={this.handleResizerMouseDown.bind(this, 'error')}></span>
              </div>
              <div class='tester-message-cell tester-header tester-message-location inline-block'
                onclick={this.handleSortByClick.bind(this, 'filePath')}
                style={`width: ${this.columnWidthRatios.location * 100}%`}>Location
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
                    <div class={
                      stateStyle === 'Icon' ?
                      'tester-message-cell tester-message-state inline-block tester-message-state-icon' :
                      'tester-message-cell tester-message-state inline-block'
                    }
                    style={`width: ${this.columnWidthRatios.state * 100}%`}>
                      {stateStyle === 'Icon' ?
                        <span class={
                          message.state === 'failed' ? 'highlight-error icon icon-x' :
                          message.state === 'skipped' ? 'highlight-warning icon icon-dash' :
                          message.state === 'passed' ? 'highlight-success icon icon-check' :
                          'unknown icon icon-question'}>
                        </span> :
                        <span class={
                          message.state === 'failed' ? 'highlight-error' :
                          message.state === 'skipped' ? 'highlight-warning' :
                          message.state === 'passed' ? 'highlight-success' :
                          'unknown'}>{message.state || 'unknown'}
                        </span>
                      }
                    </div>
                    <div class='tester-message-cell tester-message-duration inline-block'
                      style={`width: ${this.columnWidthRatios.duration * 100}%`}>{message.duration || 0}ms</div>
                    <div class='tester-message-cell tester-message-title inline-block'
                      style={`width: ${this.columnWidthRatios.title * 100}%`}>{message.title || ''}</div>
                    <div class='tester-message-cell tester-message-error inline-block'
                      style={`width: ${this.columnWidthRatios.error * 100}%`}>
                      {this.properties.softWrap ?
                        <pre class="output" innerHTML={normalizeString(message)}></pre> :
                        <span innerHTML={normalizeString(message)}></span>}
                    </div>
                    <div class='tester-message-cell tester-message-location inline-block' ref='tester-message-location'
                      style={`width: ${this.columnWidthRatios.location * 100}%`}>
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

  onTestButtonClick(callback: Function) : Disposable {
    return this.emitter.on('test-project-button-click', callback);
  }

  onSortByClick(callback: Function) : Disposable {
    return this.emitter.on('sort-by-click', callback);
  }

  onSetAdditionalArgs(callback: Function) : Disposable {
    return this.emitter.on('set-additional-args', callback);
  }

  onCurrentFileOnlyClick(callback: Function) : Disposable {
    return this.emitter.on('current-file-only-click', callback);
  }

  onClearButtonClick(callback: Function) : Disposable {
    return this.emitter.on('clear-click', callback);
  }

  handleTestButtonClick(): void {
    this.emitter.emit('test-project-button-click');
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

  getInitialWidthsForColumns(columns: Array<Column>): WidthMap {
    const columnWidthRatios = {};
    let assignedWidth = 0;
    const unresolvedColumns = [];
    columns.forEach((column) => {
      const { key, width } = column;
      if (width != null) {
        columnWidthRatios[key] = width;
        assignedWidth += width;
      } else {
        unresolvedColumns.push(column);
      }
    });
    const residualColumnWidth = (1 - assignedWidth) / unresolvedColumns.length;
    unresolvedColumns.forEach(column => columnWidthRatios[column.key] = residualColumnWidth);
    return columnWidthRatios;
  }

  handleResizerMouseDown(key: ColumnKey, event: any): void {
    if (this.globalEventsDisposable != null) {
      this.unsubscribeFromGlobalEvents();
    }
    const selection = document.getSelection();
    if (selection != null) {
      selection.removeAllRanges();
    }
    document.addEventListener('mousemove', this.handleResizerGlobalMouseMove);
    document.addEventListener('mouseup', this.handleResizerGlobalMouseUp);
    this.resizeStartX = event.pageX;
    this.tableWidth = this.refs.messages.getBoundingClientRect().width;
    this.columnBeingResized = key;
    this.globalEventsDisposable = new Disposable(() => {
      document.removeEventListener('mousemove', this.handleResizerGlobalMouseMove);
      document.removeEventListener('mouseup', this.handleResizerGlobalMouseUp);
      this.resizeStartX = null;
      this.tableWidth = null;
      this.columnBeingResized = null;
    });
  }

  unsubscribeFromGlobalEvents(): void {
    if (this.globalEventsDisposable == null) {
      return;
    }
    this.globalEventsDisposable.dispose();
    this.globalEventsDisposable = null;
  }

  handleResizerGlobalMouseUp(): void {
    this.unsubscribeFromGlobalEvents();
  }

  handleResizerGlobalMouseMove(event: any): void {
    if (this.resizeStartX == null ||
      this.tableWidth == null ||
      this.columnBeingResized == null) {
      return;
    }
    const { pageX } = (event: any);
    const deltaX = pageX - this.resizeStartX;
    const currentColumnSize = this.columnWidthRatios[this.columnBeingResized];
    const didUpdate = this.updateWidths(this.columnBeingResized, ((this.tableWidth * currentColumnSize) + deltaX) / this.tableWidth);
    if (didUpdate) {
      this.resizeStartX = pageX;
      this.update(this.properties.state, true);
    }
  }

  updateWidths(resizedColumn: string, newColumnSize: number): boolean {
    const { columnWidthRatios, columns } = this;
    const originalColumnSize = columnWidthRatios[resizedColumn];
    const columnAfterResizedColumn = columns[columns.findIndex(column => column.key === resizedColumn) + 1].key;
    const followingColumnSize = columnWidthRatios[columnAfterResizedColumn];
    const constrainedNewColumnSize = Math.max(0, Math.min(newColumnSize, followingColumnSize + originalColumnSize));
    if (Math.abs(newColumnSize - constrainedNewColumnSize) > Number.EPSILON) {
      return false;
    }
    const updatedColumnWidths = {};
    columns.forEach((column) => {
      const { key } = column;
      let width;
      if (column.key === resizedColumn) {
        width = constrainedNewColumnSize;
      } else if (column.key === columnAfterResizedColumn) {
        width = (columnWidthRatios[resizedColumn] - constrainedNewColumnSize) + columnWidthRatios[key];
      } else {
        width = columnWidthRatios[key];
      }
      updatedColumnWidths[key] = width;
    });

    this.columnWidthRatios = updatedColumnWidths;
    return true;
  }
}
