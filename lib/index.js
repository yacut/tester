'use babel'
/* @flow */

import { Disposable } from 'atom'
import Tester from './main'

export default {
  state: null,
  instance: null,

  activate(state/*: any*/) {
    console.log('activate', state);
    // if (!atom.inSpecMode()) {
    //   require('atom-package-deps').install('tester', true)
    // }
    this.instance = new Tester(state)
  },
  serialize()/*: any*/ {
    return this.state
  },
  consumeTester(tester/*: Tester*/)/*: Disposable*/ {
    console.log('consumeTester', tester);
    const testers = [].concat(tester)
    for (const entry of testers) {
      this.instance.addTester(entry)
    }
    return new Disposable(() => {
      for (const entry of testers) {
        this.instance.deleteTester(entry)
      }
    })
  },
  deactivate() {
    this.instance.dispose()
  },
}
