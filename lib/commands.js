'use babel';

// @flow

import { $ } from 'atom-space-pen-views';
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
      'tester:stop': () => this.stop(),
      'tester:toggle-tester-output': () => this.toggleTesterOutput(),
      'tester:toggle-full-size-inline-errors': () => this.toggleFullSizeInlineErrors(),
    }));
  }
  toggleTesterOutput() {
    this.emitter.emit('should-toggle-tester-output');
  }
  test() {
    this.emitter.emit('should-test');
  }
  stop() {
    this.emitter.emit('should-stop');
  }
  onShouldToggleTesterOutput(callback : Function) : Disposable {
    return this.emitter.on('should-toggle-tester-output', callback);
  }
  onShouldTest(callback : Function) : Disposable {
    return this.emitter.on('should-test', callback);
  }
  onShouldStop(callback : Function) : Disposable {
    return this.emitter.on('should-stop', callback);
  }
  toggleFullSizeInlineErrors() {
    $('.inline-block.tester-inline-message').trigger('click');
  }
  dispose() {
    this.subscriptions.dispose();
  }
}
