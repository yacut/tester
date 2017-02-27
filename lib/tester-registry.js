'use babel';

/* @flow */

import { Emitter, CompositeDisposable } from 'atom';
/* flow-include
import type { TextEditor, Disposable } from 'atom'
import type { Tester } from './types'
*/

export default class TesterRegistry {
    /* ::
    emitter: Emitter;
    testers: Set<Tester>;
    locks: Set<Tester>;
    testOnChange: boolean;
    subscriptions: CompositeDisposable;
    */

  constructor() {
    this.emitter = new Emitter();
    this.testers = new Set();
    this.locks = new Set();
    this.subscriptions = new CompositeDisposable();


    this.subscriptions.add(atom.config.observe('tester.testOnChange', (testOnChange) => {
      this.testOnChange = testOnChange;
    }));
  }

  hasTester(tester /* : Tester*/) /* : boolean*/ {
    return this.testers.has(tester);
  }

  addTester(tester /* : Tester*/) {
    console.log('addTester', tester);
    this.testers.add(tester);
  }

  deleteTester(tester /* : Tester*/) {
    console.log('deleteTester', tester);
    this.testers.delete(tester);
  }

  onDidUpdateMessages(callback /* : Function*/) /* : Disposable*/ {
    return this.emitter.on('did-update-messages', callback);
  }
  onDidBeginTesting(callback /* : Function*/) /* : Disposable*/ {
    return this.emitter.on('did-begin-testing', callback);
  }
  onDidFinishTesting(callback /* : Function*/) /* : Disposable*/ {
    return this.emitter.on('did-finish-testing', callback);
  }
  dispose() {
    this.testers.clear();
    this.subscriptions.dispose();
  }
  test(onChange/* : Event*/, editorTester/* : TextEditor*/) {
    console.log('TEST', onChange, editorTester);
    const editor = editorTester.getEditor();

    if (!editor.getPath() ||
        editor !== atom.workspace.getActiveTextEditor() ||
        this.locks.has(editorTester)) {
      console.log('Nothing todo');
      return Promise.resolve();
    }

    this.locks.add(editorTester);

    const promises = [];
    this.testers.forEach((tester) => {
      promises.push(new Promise((resolve) => {
        resolve(tester.test(editor));
      }).then((results) => {
        console.log('did-update-messages', results);
        if (results) {
          this.emitter.emit('did-update-messages', { tester, messages: results, editor });
        }
      }));
    });
    console.log('Promises all', promises);
    return Promise.all(promises).then((results) => {
      console.log('All DONE', results);
      this.locks.delete(editorTester);
    });
  }
}
