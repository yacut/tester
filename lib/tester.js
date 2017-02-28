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

    if (!this.statusBarTile) {
      const div = document.createElement('div');
      div.classList.add('inline-block');
      const statusSpan = document.createElement('span');
      statusSpan.textContent = '0 tests';
      const statusTiny = document.createElement('span');
      statusTiny.textContent = '';
      statusTiny.className = 'tester-tiny loading loading-spinner-tiny inline-block';
      statusTiny.style.display = 'none';
      const button = document.createElement('div');
      button.appendChild(statusSpan);
      button.appendChild(statusTiny);

      button.onclick = function linkOnClick(e) {
        return console.log('Tester is here!', e);
      };

      atom.tooltips.add(div, {
        title: 'Toggle Tester Output Console',
      });

      div.appendChild(button);

      this.statusBarTile = statusBar.addLeftTile({
        item: div,
        priority: 0,
      });

      this.statusBarTile.statusSpan = statusSpan;
      this.statusBarTile.testRunning = function () {
        console.log('---> statusBarTile.testRunning', statusSpan);
        statusTiny.style.display = 'inline-block';
      };
      this.statusBarTile.testFinished = function () {
        console.log('---> statusBarTile.testFinished', statusSpan);
        statusTiny.style.display = 'none';
      };

      this.statusBarTile.testResults = function (results) {
        console.log('---> statusBarTile.testResults', statusSpan, results);
        if (!results) {
          statusSpan.textContent = '0 tests';
        } else {
          statusSpan.textContent = `${results.length} tests`;
        }
      };
      this.instance.setStatusBarTile(this.statusBarTile);
    }
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
