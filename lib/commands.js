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
      'tester:toggle-full-size-inline-errors': () => this.toggleFullSizeInlineErrors(),
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'tester:test-project': () => this.testProject(),
      'tester:test-last': () => this.testLast(),
      'tester:stop': () => this.stop(),
      'tester:clear': () => this.clear(),
      'tester:toggle-tester-output': () => this.toggleTesterOutput(),
      'tester:toggle-tester-result': () => this.toggleTesterResultView(),
      'tester:go-to-next-test': () => this.goToNextTest(),
      'tester:go-to-previous-test': () => this.goToPreviousTest(),
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
  testLast() {
    this.emitter.emit('should-test-last');
  }
  testProject() {
    this.emitter.emit('should-test-project');
  }
  stop() {
    this.emitter.emit('should-stop');
  }
  clear() {
    this.emitter.emit('should-clear');
  }
  goToNextTest() {
    this.emitter.emit('should-go-to-next-test');
  }
  goToPreviousTest() {
    this.emitter.emit('should-go-to-previous-test');
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
  onShouldTestLast(callback : Function) : Disposable {
    return this.emitter.on('should-test-last', callback);
  }
  onShouldTestProject(callback : Function) : Disposable {
    return this.emitter.on('should-test-project', callback);
  }
  onShouldStop(callback : Function) : Disposable {
    return this.emitter.on('should-stop', callback);
  }
  onShouldClear(callback : Function) : Disposable {
    return this.emitter.on('should-clear', callback);
  }
  onShouldGoToNextTest(callback: Function): Disposable {
    return this.emitter.on('should-go-to-next-test', callback);
  }
  onShouldGoToPreviousTest(callback: Function): Disposable {
    return this.emitter.on('should-go-to-previous-test', callback);
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
