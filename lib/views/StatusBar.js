'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable } from 'atom';
import type { Message } from '../types';

export default class ConsoleOutputView {
  properties: {
    messages: Array<Message>;
    onclick: Function;
    runningTestersCount: number;
    editor: any;
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
    const failedTests = this.properties.messages.filter(result => result.state === 'failed').length;
    const skippedTests = this.properties.messages.filter(result => result.state === 'skipped').length;
    const passedTests = this.properties.messages.filter(result => result.state === 'passed').length;
    return (
      <div class='status-bar-tester inline-block' onclick={this.properties.onclick}
        style={atom.workspace.isTextEditor(this.properties.editor) ? 'display:inline-block;' : 'display:none;'}>

        <span class={failedTests > 0 ?
          'tester-bottom-status tester-status-failed highlight' :
          'tester-bottom-status tester-status-failed highlight-error'}>
          {failedTests}
        </span>
        <span class={skippedTests > 0 ?
          'tester-bottom-status tester-status-skipped highlight' :
          'tester-bottom-status tester-status-skipped highlight-warning'}>
          {skippedTests}
        </span>
        <span class={passedTests > 0 ?
          'tester-bottom-status tester-status-passed highlight' :
          'tester-bottom-status tester-status-passed highlight-success'}>
          {passedTests}
        </span>
        <span class={this.properties.runningTestersCount > 0 ?
          'tester-tiny loading loading-spinner-tiny inline-block' :
          'tester-tiny loading loading-spinner-tiny inline-block idle'}/>
      </div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.messages !== newProperties.messages ||
        this.properties.editor !== newProperties.editor ||
        this.properties.runningTestersCount !== newProperties.runningTestersCount) {
      if (newProperties.messages) {
        this.properties.messages = newProperties.messages;
      }
      if (newProperties.editor) {
        this.properties.editor = newProperties.editor;
      }
      if (newProperties.runningTestersCount || newProperties.runningTestersCount === 0) {
        this.properties.runningTestersCount = newProperties.runningTestersCount;
      }
      return etch.update(this);
    }
    return Promise.resolve();
  }

  async destroy() {
    await etch.destroy(this);
  }

  getElement() {
    return this.element;
  }
}
