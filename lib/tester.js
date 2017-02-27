'use babel'
/* @flow */

import { Disposable } from 'atom'
import Tester from './main'
import type { State } from './types'

export default {
  state: null,
  instance: null,
  statusBarTile: null,
  consumeStatusBar(statusBar/*: any*/){
  	console.log("consumeStatusBar", statusBar);
    if (!this.statusBarTile) {
      var div = document.createElement('div');
      div.classList.add('inline-block');
      var icon = document.createElement('span');
      icon.textContent = 'Tester';
      var link = document.createElement('a');
      link.appendChild(icon);

      link.onclick = function(e) {
        return console.log('Tester is here!');
      };

      atom.tooltips.add(div, {
        title: "Toggle Tester Output Console"
      });

      div.appendChild(link);

      this.statusBarTile = statusBar.addRightTile({
        item: div,
        priority: 0
      });
    }
  },

  activate(state/*: State*/) {
    console.log('activate', state);
    this.instance = new Tester(state)
  },
  serialize()/*: State*/ {
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
    if(this.statusBarTile){
      this.statusBarTile.destroy()
    }
    this.statusBarTile = null
  },
}
