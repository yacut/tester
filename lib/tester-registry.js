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
  projectLock: boolean;
  subscriptions: CompositeDisposable;

  constructor() {
    this.emitter = new Emitter();
    this.testers = new Set();
    this.locks = new Set();
    this.projectLock = false;
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
  async test(editorTester :?EditorTester, isProjectTest :?boolean, additionalArgs :?string) : Promise<boolean> {
    if (!editorTester && !isProjectTest) {
      return Promise.resolve(true);
    }
    let editor;
    if (editorTester) {
      editor = editorTester.editor;
      if (!editor || !editor.getPath() || this.locks.has(editorTester) || editor.isModified()) {
        return Promise.resolve(true);
      }
      this.locks.add(editorTester);
    } else {
      if (this.projectLock) {
        return Promise.resolve(true);
      }
      this.projectLock = true;
    }

    const promises:Array<Promise<any>> = [];
    this.testers.forEach((tester) => {
      if (!isProjectTest) {
        let shouldTriggerTester = false;
        try {
          shouldTriggerTester = tester.scopes.some(scope =>
            globToRegex(scope).test(convertWindowsPathToUnixPath(editor.getPath())));
        } catch (error) {
          console.error('Tester: ', error);
        }
        if (!shouldTriggerTester) {
          return Promise.resolve(true);
        }
      }
      promises.push(new Promise(resolve => resolve(tester.test(editor, additionalArgs))));
    });

    if (promises.length > 0) {
      this.emitter.emit('did-begin-testing', { editorTester });
    }
    await Promise.all(promises)
      .then((results) => {
        let messages = [];
        let output = '';
        results.forEach((result) => {
          messages = messages.concat(result.messages);
          output += result.output;
        });
        if (promises.length > 0) {
          this.emitter.emit('did-update-messages', { editor, messages, output });
        }
      })
      .then(() => {
        if (editorTester) {
          this.locks.delete(editorTester);
        } else {
          this.projectLock = false;
        }
        if (promises.length > 0) {
          this.emitter.emit('did-finish-testing', { editorTester });
        }
      })
      .catch((error) => {
        console.error('Tester: ', error);
        this.projectLock = false;
        this.emitter.emit('did-finish-testing', { editorTester });
        return false;
      });
    return true;
  }

  async stop(editorTester : ?EditorTester) : Promise<boolean> {
    const promises:Array<Promise<any>> = [];
    this.testers.forEach((tester) => {
      promises.push(new Promise(resolve => resolve(tester.stop(editorTester ? editorTester.editor : null))));
    });
    await Promise.all(promises)
      .then(() => {
        if (editorTester) {
          this.locks.delete(editorTester);
        }
        this.projectLock = false;
        this.emitter.emit('did-finish-testing', { editorTester });
      })
      .catch((error) => {
        console.error('Tester: ', error);
        return false;
      });
    return true;
  }
}
