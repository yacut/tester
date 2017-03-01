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
  test(onChange/* : Event*/, editorTester/* : TextEditor*/)/* : Promise<boolean> */ {
    console.log('TEST', onChange, editorTester, this.locks, atom.workspace.getActiveTextEditor());
    const editor = editorTester.getEditor();

    if (!editor.getPath() ||
        this.locks.has(editorTester)) {
      console.log('Nothing todo', editor, this.locks);
      return Promise.resolve(true);
    }

    this.emitter.emit('did-begin-testing', { editorTester, editor });
    this.locks.add(editorTester);

    const promises = [];
    this.testers.forEach((tester) => {
      promises.push(new Promise((resolve) => {
        console.log('resolve promise', resolve, tester);
        resolve(tester.test(editor));
      })
      .then((results) => {
        console.log('did-update-messages', results);
        if (results) {
          this.emitter.emit('did-update-messages', { tester, editor, messages: results });
        }
      })
      .catch((error) => { console.log('tester error', error); }));
    });
    console.log('Promises all', promises);
    return Promise.all(promises)
      .then((results) => {
        console.log('All DONE', results);
        this.locks.delete(editorTester);
        this.emitter.emit('did-finish-testing', { editorTester, editor });
      })
      .catch((err) => {
        console.log('All catch', err);
      });
  }
}
