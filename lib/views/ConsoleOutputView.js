'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable } from 'atom';
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

  constructor(properties:Object) {
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
      <div class='tester-view'>
        <pre class={this.properties.state.testRunning ? 'output running' : 'output'} ref='output'></pre>
      </div>
    );
  }

  update(newState :TesterState) {
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
