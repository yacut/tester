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

    this.disposables.add(atom.tooltips.add(this.refs.failed, { title: 'Failed Tests' }));
    this.disposables.add(atom.tooltips.add(this.refs.skipped, { title: 'Skipped Tests' }));
    this.disposables.add(atom.tooltips.add(this.refs.passed, { title: 'Passed Tests' }));
    this.disposables.add(atom.tooltips.add(this.refs.beaker, { title: 'Click to toggle Tester' }));
  }

  render() {
    const failedTests = this.properties.messages.filter(result => result.state === 'failed').length;
    const skippedTests = this.properties.messages.filter(result => result.state === 'skipped').length;
    const passedTests = this.properties.messages.filter(result => result.state === 'passed').length;
    return (
      <div class='status-bar-tester inline-block' onclick={this.properties.onclick} style='display:inline-block;font-size: 0.9em;'>
        <a ref='beaker' class='icon icon-beaker'></a>
        <a ref='failed' class={failedTests > 0 ?
          'tester-bottom-status tester-status-failed highlight-error' :
          'tester-bottom-status tester-status-failed highlight'}>
          {failedTests}
        </a>
        <a ref='skipped' class={skippedTests > 0 ?
          'tester-bottom-status tester-status-skipped highlight-warning' :
          'tester-bottom-status tester-status-skipped highlight'}>
          {skippedTests}
        </a>
        <a ref='passed' class={passedTests > 0 ?
          'tester-bottom-status tester-status-passed highlight-success' :
          'tester-bottom-status tester-status-passed highlight'}>
          {passedTests}
        </a>
        <span ref='tiny' class={this.properties.runningTestersCount > 0 ?
          'tester-tiny loading loading-spinner-tiny inline-block' :
          'tester-tiny loading loading-spinner-tiny inline-block idle'}/>
      </div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.messages !== newProperties.messages ||
        this.properties.runningTestersCount !== newProperties.runningTestersCount) {
      if (newProperties.messages) {
        this.properties.messages = newProperties.messages;
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
    this.disposables.dispose();
  }

  getElement() {
    return this.element;
  }
}
