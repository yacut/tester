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
    this.instance.createStatusBar(statusBar);
  },

  activate(state/* : State*/) {
    this.instance = new Tester(state);
  },
  serialize()/* : State*/ {
    return this.state;
  },
  consumeTester(tester/* : Tester*/)/* : Disposable*/ {
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
