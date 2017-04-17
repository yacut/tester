'use babel';

// @flow

import { CompositeDisposable, Emitter } from 'atom';
import type { Disposable } from 'atom';


export default class Commands {
  emitter: Emitter;
  subscriptions: CompositeDisposable;

  constructor() {
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'tester:test': () => this.test(),
      'tester:test-project': () => this.testProject(),
      'tester:stop': () => this.stop(),
      'tester:toggle-tester-output': () => this.toggleTesterOutput(),
      'tester:toggle-tester-result': () => this.toggleTesterResultView(),
      'tester:toggle-full-size-inline-errors': () => this.toggleFullSizeInlineErrors(),
    }));
  }
  toggleTesterOutput() {
    this.emitter.emit('should-toggle-tester-output');
  }
  toggleTesterResultView() {
    this.emitter.emit('should-toggle-tester-result-view');
  }
  test() {
    this.emitter.emit('should-test');
  }
  testProject() {
    this.emitter.emit('should-test', true);
  }
  stop() {
    this.emitter.emit('should-stop');
  }
  onShouldToggleTesterOutput(callback : Function) : Disposable {
    return this.emitter.on('should-toggle-tester-output', callback);
  }
  onShouldToggleTesterResultView(callback : Function) : Disposable {
    return this.emitter.on('should-toggle-tester-result-view', callback);
  }
  onShouldTest(callback : Function) : Disposable {
    return this.emitter.on('should-test', callback);
  }
  onShouldStop(callback : Function) : Disposable {
    return this.emitter.on('should-stop', callback);
  }
  toggleFullSizeInlineErrors() {
    Array.from(document.getElementsByClassName('tester-inline-message')).forEach(item => item.click());
  }
  togglePanel(): void {
    atom.config.set('tester.togglePanel', !atom.config.get('tester.togglePanel'));
  }
  dispose() {
    this.subscriptions.dispose();
  }
}
