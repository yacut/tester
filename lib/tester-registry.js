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
    this.testers.add(tester);
  }

  deleteTester(tester /* : Tester*/) {
    this.testers.delete(tester);
  }

  onShouldTriggerTester(callback /* : Function*/) /* : Disposable*/ {
    return this.emitter.on('should-trigger-tester', callback);
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
  async test(onChange/* : Event*/, editorTester/* : TextEditor*/)/* : Promise<boolean> */ {
    const editor = editorTester.getEditor();
    if (!editor.getPath() || this.locks.has(editorTester)) {
      return Promise.resolve(true);
    }

    this.emitter.emit('did-begin-testing', { editorTester, editor });
    this.locks.add(editorTester);

    const promises = [];
    this.testers.forEach((tester) => {
      const shouldTriggerTester = tester.scopes.some(scope => new RegExp(scope.replace('*', '.*')).test(editor.getPath()));
      this.emitter.emit('should-trigger-tester', { shouldTriggerTester });
      if (!shouldTriggerTester) {
        return;
      }
      promises.push(new Promise((resolve) => {
        // $FlowIgnore: Type too complex
        resolve(tester.test(editor));
      })
      .then(({ messages, output }) => {
        if (messages) {
          this.emitter.emit('did-update-messages', { tester, editor, messages, output });
        }
      })
      .catch((error) => {
        atom.notifications.addError(`Tester error: ${error.toString()}`);
      }));
    });
    await Promise.all(promises)
      .then(() => {
        this.locks.delete(editorTester);
        this.emitter.emit('did-finish-testing', { editorTester, editor });
      })
      .catch((error) => {
        atom.notifications.addError(`Tester error: ${error.toString()}`);
      });
    return true;
  }
}
