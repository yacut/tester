'use babel';

/* @flow */

import { CompositeDisposable, Emitter } from 'atom';
/* flow-include
import type { Disposable } from 'atom'
*/

export default class Commands {
  /* ::
  emitter: Emitter;
  subscriptions: CompositeDisposable;
  */

  constructor() {
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'tester:test': () => this.test(),
      'tester:toggle-tester-output': () => this.toggleTesterOutput(),
    }));
  }
  toggleTesterOutput() {
    this.emitter.emit('should-toggle-tester-output');
  }
  test() {
    this.emitter.emit('should-test');
  }
  onShouldToggleTesterOutput(callback/* : Function*/)/* : Disposable*/ {
    return this.emitter.on('should-toggle-tester-output', callback);
  }
  onShouldTest(callback/* : Function*/)/* : Disposable*/ {
    return this.emitter.on('should-test', callback);
  }
  dispose() {
    this.subscriptions.dispose();
  }
}
