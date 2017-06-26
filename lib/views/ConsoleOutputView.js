'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, TextEditor } from 'atom';
import { convertAnsiStringToHtml, escapeHtml } from '../helpers';
import type { TesterState } from '../types';

export const defaultContent = '<i>No console output</i>';

export default class ConsoleOutputView {
  properties: {
    state: TesterState;
  }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties: {state: TesterState}) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    etch.initialize(this);

    let content = properties.state.output;
    if (!content) {
      content = defaultContent;
    } else {
      content = escapeHtml(content);
      if (atom.config.get('tester.ansiToHtml')) {
        content = convertAnsiStringToHtml(content);
      }
    }
    this.refs.output.innerHTML = content;
  }

  render() {
    return (
      <div class='tester-view native-key-bindings' style='padding: 0px 0px 0px 4px;'>
        <div class='tester-toolbar inline-block'>
          <div class='inline-block pull-left'>
            <div class='inline-block-tight' style='width: 200px; font-size: 0.8em;'>
              {etch.dom(TextEditor, {
                ref: 'search',
                mini: true,
                placeholderText: 'Search',
              })}
            </div>
          </div>
          <div class='inline-block pull-right'>
            <div class='inline-block-tight btn-group'>
              <button class='btn btn-sm icon icon-jump-down'></button>
              <button class='btn btn-sm icon icon-jump-up'></button>
            </div>
            <button class='inline-block-tight btn btn-sm icon icon-trashcan'
              title='Clear'
              ref='clear'
              // onclick={this.handleClearButtonClick.bind(this)}
            >Clear</button>
          </div>
        </div>
        <pre class={this.properties.state.testRunning ? 'output running' : 'output'} ref='output'></pre>
      </div>
    );
  }

  update(newState: TesterState) {
    if (this.properties.state !== newState) {
      this.properties.state = newState;
      let content = this.properties.state.output;
      if (!content) {
        content = defaultContent;
      } else {
        content = escapeHtml(content);
        if (atom.config.get('tester.ansiToHtml')) {
          content = convertAnsiStringToHtml(content);
        }
      }
      this.refs.output.innerHTML = content;

      if (this.properties.scrollToBottom) {
        this.refs.output.scrollTop = this.refs.output.scrollHeight;
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
    return 'Tester Console';
  }

  getIconName() {
    return 'terminal';
  }

  getDefaultLocation() {
    return 'bottom';
  }

  getAllowedLocations() {
    return ['left', 'right', 'bottom'];
  }

  getURI() {
    return 'atom://tester-console-output';
  }

  getElement() {
    return this.element;
  }

  serialize() {
    return {
      deserializer: 'tester-console-output',
    };
  }
}
