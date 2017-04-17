'use babel';

// @flow

import globToRegex from 'glob-to-regexp';
import { Emitter, CompositeDisposable } from 'atom';
import type { Disposable } from 'atom';
import { convertWindowsPathToUnixPath } from './helpers';
import EditorTester from './editor-tester';
import type { Tester } from './types';

export default class TesterRegistry {
  emitter: Emitter;
  testers: Set<Tester>;
  locks: Set<EditorTester>;
  subscriptions: CompositeDisposable;


  constructor() {
    this.emitter = new Emitter();
    this.testers = new Set();
    this.locks = new Set();
    this.subscriptions = new CompositeDisposable();
  }

  hasTester(tester : Tester) : boolean {
    return this.testers.has(tester);
  }

  addTester(tester : Tester) {
    this.testers.add(tester);
  }

  deleteTester(tester : Tester) {
    this.testers.delete(tester);
  }

  onShouldTriggerTester(callback : Function) : Disposable {
    return this.emitter.on('should-trigger-tester', callback);
  }
  onDidUpdateMessages(callback : Function) : Disposable {
    return this.emitter.on('did-update-messages', callback);
  }
  onDidBeginTesting(callback : Function) : Disposable {
    return this.emitter.on('did-begin-testing', callback);
  }
  onDidFinishTesting(callback : Function) : Disposable {
    return this.emitter.on('did-finish-testing', callback);
  }
  dispose() {
    this.testers.clear();
    this.subscriptions.dispose();
  }
  async test(editorTester : EditorTester, shouldTestCurrentProject :?boolean) : Promise<boolean> {
    console.log('tester-registry', shouldTestCurrentProject);
    const editor = editorTester.editor;
    if (!editor.getPath() || this.locks.has(editorTester) || editor.isModified()) {
      return Promise.resolve(true);
    }

    this.locks.add(editorTester);
    const promises = [];
    this.testers.forEach((tester) => {
      if (!shouldTestCurrentProject) {
        let shouldTriggerTester = false;
        try {
          shouldTriggerTester = tester.scopes.some(scope =>
          globToRegex(scope).test(convertWindowsPathToUnixPath(editor.getPath())));
        } catch (error) {
          console.error('Tester: ', error);
        }
        if (!shouldTriggerTester) {
          return;
        }
      }
      this.emitter.emit('did-begin-testing', { editorTester });
      promises.push(new Promise((resolve) => {
        // $FlowIgnore: Type too complex
        resolve(tester.test(editor, shouldTestCurrentProject));
      })
      .then(({ messages, output }) => {
        if (messages) {
          this.emitter.emit('did-update-messages', { tester, editor, messages, output });
        }
      })
      .catch((error) => {
        console.error('Tester: ', error);
        return false;
      }));
    });
    await Promise.all(promises)
      .then(() => {
        this.locks.delete(editorTester);
        if (promises.length > 0) {
          this.emitter.emit('did-finish-testing', { editorTester });
        }
      })
      .catch((error) => {
        console.error('Tester: ', error);
        return false;
      });
    return true;
  }

  async stop(editorTester : EditorTester) : Promise<boolean> {
    const promises = [];
    this.testers.forEach((tester) => {
      promises.push(new Promise((resolve) => {
        // $FlowIgnore: Type too complex
        resolve(tester.stop(editorTester));
      }));
    });
    await Promise.all(promises)
      .then(() => {
        this.locks.delete(editorTester);
        this.emitter.emit('did-finish-testing', { editorTester });
      })
      .catch((error) => {
        console.error('Tester: ', error);
        return false;
      });
    return true;
  }
}
