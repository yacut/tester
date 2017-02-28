'use babel';

/* @flow */

import { Disposable } from 'atom';
import Tester from './main';

/* flow-include
import type { State } from './types'
*/

export default {
  state: null,
  instance: null,
  statusBarTile: null,
  consumeStatusBar(statusBar/* : any*/) {
    console.log('consumeStatusBar', statusBar);
    this.instance.createStatusBar(statusBar);
  },

  activate(state/* : State*/) {
    console.log('activate', state);
    this.instance = new Tester(state);
  },
  serialize()/* : State*/ {
    return this.state;
  },
  consumeTester(tester/* : Tester*/)/* : Disposable*/ {
    console.log('consumeTester', tester);
    const testers = [].concat(tester);
    for (const entry of testers) {
      this.instance.addTester(entry);
    }
    return new Disposable(() => {
      for (const entry of testers) {
        this.instance.deleteTester(entry);
      }
    });
  },
  deactivate() {
    this.instance.dispose();
    if (this.statusBarTile) {
      this.statusBarTile.destroy();
    }
    this.statusBarTile = null;
  },
};
