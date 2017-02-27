/* @flow */

import { Emitter, CompositeDisposable } from 'atom'
import type { TextEditor, Disposable } from 'atom'
import type { Tester } from './types'


export default class LinterRegistry {
  /*::
  emitter: Emitter;
  testers: Set<Tester>;
  testOnChange: boolean;
  subscriptions: CompositeDisposable;
  */

  constructor() {
    this.emitter = new Emitter()
    this.testers = new Set()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(atom.config.observe('tester.testOnChange', (testOnChange) => {
      this.testOnChange = testOnChange
    }))
  }

  hasTester(tester: Tester): boolean {
    return this.testers.has(tester)
  }

  addTester(tester: Tester) {
    console.log('addTester', tester)
  }

  deleteTester(tester: Tester) {
    console.log('deleteTester', tester)
  }
}
