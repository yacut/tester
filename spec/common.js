'use babel';

/* @flow*/

import Path from 'path';
import { Subject, Observable } from 'rxjs';
import { ActionsObservable } from 'redux-observable';

import type { TesterAction, TesterEpic, TesterState } from '../lib/types';

export const passedTest = {
  duration: 1,
  error: null,
  filePath: '/path/to/spec.js',
  lineNumber: 1,
  state: 'passed',
  title: 'passed test',
};

export const skippedTest = {
  duration: 0,
  error: null,
  filePath: '/path/to/some-spec.js',
  lineNumber: 2,
  state: 'skipped',
  title: 'skipped test',
};

export const failedTest = {
  duration: 1,
  error: {
    name: 'optional error object',
    message: 'something went wrong',
    actual: 'optional actual result',
    expected: 'optional expected result',
    operator: 'optional operator',
  },
  filePath: 'file path to highlight',
  lineNumber: 1,
  state: 'failed',
  title: 'some test title',
};

export const messages = [passedTest, failedTest];

export const state = {
  additionalArgs: '',
  currentFileOnly: false,
  currentMessage: null,
  editor: null,
  isProjectTest: false,
  messages: [],
  output: '',
  rawMessages: [],
  sorter: { key: '', desc: false },
  testers: [],
  testRunning: false,
};

export const sampleTester = {
  name: 'tester-name',
  options: {},
  scopes: ['*test.js', '**spec.js'],
  test() {
      // Note, a Promise may be returned as well!
    return {
      messages,
      output: 'tester console output',
    };
  },
  stop() {},
};

export function getFixturesPath() : string {
  return Path.join(__dirname, 'fixtures/test.txt');
}

export function getEditorTester(textEditor : any) : any {
  return { editor: textEditor };
}

export function sleep(milliSeconds: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, milliSeconds); });
}

// https://jasmine.github.io/1.3/introduction?#section-Asynchronous_Support
export function asyncTest(run: Function) {
  return () => {
    let done = false;
    waitsFor(() => done);
    run(() => { done = true; });
  };
}
export function getEpicActions(epic: TesterEpic, action: TesterAction, currentState: TesterState = state) {
  const actions = new Subject();
  const actions$ = new ActionsObservable(actions);
  const store = {
    getState: () => currentState,
    dispatch: a => ActionsObservable.concat(actions$, Observable.of(a)),
  };
  const promiseEpic = epic(actions$, store)
    .toArray()
    .toPromise();

  actions.next(action);
  actions.complete();

  return promiseEpic;
}
