'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable } from 'atom';
import type { TesterState } from '../types';

export default class ConsoleOutputView {
  properties: {
    state: TesterState;
    onclick: Function;
  }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties :{ state: TesterState, onclick: Function }) {
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
    let messages = this.properties.state.messages;
    if (!messages || messages.constructor !== Array) {
      messages = [];
    }
    const failedTests = messages.filter(result => result.state === 'failed').length;
    const skippedTests = messages.filter(result => result.state === 'skipped').length;
    const passedTests = messages.filter(result => result.state === 'passed').length;
    return (
      <div class='status-bar-tester inline-block' onclick={this.properties.onclick} style='display:inline-block;font-size: 0.9em;'>
        <a ref='beaker' class={this.properties.state.testRunning ?
          'icon icon-beaker tester-wait-bottom-status' :
          'icon icon-beaker'}>
        </a>
        <a ref='failed' class={(failedTests > 0 ?
          'tester-bottom-status tester-status-failed highlight-error' :
          'tester-bottom-status tester-status-failed highlight') +
          (this.properties.state.testRunning ? ' tester-wait-bottom-status' : '')}>
          {failedTests}
        </a>
        <a ref='skipped' class={(skippedTests > 0 ?
          'tester-bottom-status tester-status-skipped highlight-warning' :
          'tester-bottom-status tester-status-skipped highlight') +
          (this.properties.state.testRunning ? ' tester-wait-bottom-status' : '')}>
          {skippedTests}
        </a>
        <a ref='passed' class={(passedTests > 0 ?
          'tester-bottom-status tester-status-passed highlight-success' :
          'tester-bottom-status tester-status-passed highlight') +
          (this.properties.state.testRunning ? ' tester-wait-bottom-status' : '')}>
          {passedTests}
        </a>
      </div>
    );
  }

  update(newState :TesterState) {
    if (this.properties.state !== newState) {
      this.properties.state = newState;
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
