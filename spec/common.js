'use babel';

/* @flow*/

import Path from 'path';
import { Subject } from 'rxjs';
import { ActionsObservable } from 'redux-observable';

import type { TesterAction, TesterEpic, TesterState } from '../lib/types';

export const messages = [
  {
    duration: 1, // duration in ms
    error: {
      name: 'optional error object',
      message: 'something went wrong',
      actual: 'optional actual result', // can be an object
      expected: 'optional expected result', // can be an object
      operator: 'optional operator',
    },
    filePath: 'file path to highlight',
    lineNumber: 1, // line number to highlight
    state: 'failed', // 'passed' | 'failed' | 'skipped',
    title: 'some test title',
  },
];

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

export function getTester() : Object {
  return {
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
  };
}

export function getFixturesPath(path : string) : string {
  return Path.join(__dirname, 'fixtures', path);
}

export function getEditorTester(textEditor : any) : any {
  return { editor: textEditor };
}

export function sleep(milliSeconds: number): Promise<void> {
  return new Promise((resolve) => { setTimeout(resolve, milliSeconds); });
}

export function getEpicActions(epic: TesterEpic, action: TesterAction, currentState: TesterState = state) {
  const actions = new Subject();
  const actions$ = new ActionsObservable(actions);
  const store = {
    getState: () => currentState,
    dispatch: a => ActionsObservable.concat(actions$, a),
  };
  const promiseEpic = epic(actions$, store)
    .toArray()
    .toPromise();

  actions.next(action);
  actions.complete();

  return promiseEpic;
}
