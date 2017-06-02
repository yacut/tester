'use babel';

/* @flow*/
import type {
  Message,
  Tester,
  TesterAction,
  TesterFilter,
  TesterSorter,
} from '../types';

/*
 * action types
 */

export const ADD_TESTER = 'tester/addTester';
export const ERROR = 'tester/error';
export const FILTER_MESSAGES = 'tester/filterMessages';
export const REMOVE_TESTER = 'tester/removeTester';
export const SORT_MESSAGES = 'tester/sortMessages';
export const START_TEST = 'tester/startTest';
export const STOP_TEST = 'tester/stopTest';
export const TEST = 'tester/test';
export const TEST_LAST = 'tester/testLast';
export const TEST_PROJECT = 'tester/testProject';
export const UPDATE_EDITOR = 'tester/updateEditor';
export const UPDATE_MESSAGES = 'tester/updateMessages';
export const UPDATE_OUTPUT = 'tester/updateOutput';

export const CLEAR_CONSOLE = 'tester/clearConsole';
export const CLEAR_MESSAGES = 'tester/clearMessages';

/*
 * action creators
 */

export function addTesterAction(tester: Tester): TesterAction {
  return {
    type: ADD_TESTER,
    payload: { tester },
  };
}

export function errorAction(message: string): TesterAction {
  return {
    type: ERROR,
    errorMessage: message,
  };
}

export function filterMessagesAction(filter: TesterFilter): TesterAction {
  return {
    type: FILTER_MESSAGES,
    payload: { filter },
  };
}

export function removeTesterAction(tester: Tester): TesterAction {
  return {
    type: REMOVE_TESTER,
    payload: { tester },
  };
}

export function sortMessagesAction(sorter: TesterSorter): TesterAction {
  return {
    type: SORT_MESSAGES,
    payload: { sorter },
  };
}

export function startTestAction(): TesterAction {
  return {
    type: START_TEST,
  };
}

export function stopTestAction(): TesterAction {
  return {
    type: STOP_TEST,
  };
}

export function testAction(): TesterAction {
  return {
    type: TEST,
  };
}

export function testLastAction(): TesterAction {
  return {
    type: TEST_LAST,
  };
}

export function testProjectAction(): TesterAction {
  return {
    type: TEST_PROJECT,
  };
}

export function updateEditorAction(editor: any): TesterAction {
  return {
    type: UPDATE_EDITOR,
    payload: { editor },
  };
}

export function updateMessagesAction(messages: Array<Message>): TesterAction {
  return {
    type: UPDATE_MESSAGES,
    payload: { messages },
  };
}

export function updateOutputAction(output: string): TesterAction {
  return {
    type: UPDATE_OUTPUT,
    payload: { output },
  };
}
