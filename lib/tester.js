'use babel';

// @flow

import { Disposable } from 'atom';
import Tester from './main';

export default {
  instance: null,
  consumeStatusBar(statusBar : any) {
    this.instance.createStatusBar(statusBar);
  },

  activate() {
    this.instance = new Tester();
  },

  consumeTester(tester : Tester) : Disposable {
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
  },
};
