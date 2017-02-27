'use babel'
/* @flow */

import { CompositeDisposable } from 'atom'
import type { State } from './types'

class Tester {
  state: State;
  subscriptions: CompositeDisposable;

  constructor(state: State) {
    this.state = state

    this.subscriptions = new CompositeDisposable()
  }
  dispose() {
    this.subscriptions.dispose()
  }

}

module.exports = Tester
