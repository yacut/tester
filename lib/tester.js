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
      var statusSpan = document.createElement('span');
      var link = document.createElement('a');
      link.appendChild(statusSpan);

      link.onclick = function(e) {
        return console.log('Tester is here!');
      };

      atom.tooltips.add(div, {
        title: "Toggle Tester Output Console"
      });

      div.appendChild(link);

      this.statusBarTile = statusBar.addLeftTile({
        item: div,
        priority: 100
      });

      this.statusBarTile.statusSpan = statusSpan;
      this.statusBarTile.testRunning = function(){
        console.log('statusBarTile.testRunning');
        statusSpan.className = 'loading loading-spinner-tiny inline-block';
        statusSpan.textContent = '';
      };

      this.statusBarTile.testResults = function(results){
        console.log('statusBarTile.testResults', results);
        statusSpan.className = '';
        statusSpan.textContent = '1 Failed';
      };
    }
  },

  activate(state/*: State*/) {
    console.log('activate', state);
    this.instance = new Tester(state, this.statusBarTile)
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
