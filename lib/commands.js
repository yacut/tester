'use babel';
/* @flow */

import { CompositeDisposable, Emitter } from 'atom'
import type { Disposable } from 'atom'

export default class Commands {
  /*::
  emitter: Emitter;
  subscriptions: CompositeDisposable;
  */
 
  constructor() {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
      'tester:test': () => this.test(),
      'tester:toggle-active-editor': () => this.toggleActiveEditor(),
    }))
  }
  toggleActiveEditor() {
    this.emitter.emit('should-toggle-active-editor')
  }
  test() {
    this.emitter.emit('should-test')
  }
  onShouldToggleActiveEditor(callback/*: Function*/)/*: Disposable*/ {
    return this.emitter.on('should-toggle-active-editor', callback)
  }
  onShouldTest(callback/*: Function*/)/*: Disposable*/ {
    return this.emitter.on('should-test', callback)
  }
  dispose() {
    this.subscriptions.dispose()
  }
}
