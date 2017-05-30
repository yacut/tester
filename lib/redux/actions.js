'use babel';

/* @flow*/
import type {
  Message,
  TesterAction,
} from '../types';

/*
 * action types
 */

export const UPDATE_MESSAGES = 'tester/updateMessages';
export const UPDATE_OUTPUT = 'tester/updateOutput';
export const UPDATE_EDITOR = 'tester/updateEditor';

export const BEGIN_TEST = 'tester/beginTest';
export const FINISH_TEST = 'tester/finishTest';

export const TOGGLE_CONSOLE = 'tester/toggleConsole';
export const TOGGLE_RESULTS = 'tester/toggleResults';
export const CLEAR_CONSOLE = 'tester/clearConsole';
export const CLEAR_MESSAGES = 'tester/clearMessages';

export const SORT_MESSAGES = 'tester/sortMessages';
export const SOFT_WRAP = 'tester/softWrap';

export const ERROR = 'tester/error';

export const SORT_BY_COLUMN = 'tester/sortByColumn';

/*
 * action creators
 */
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

export function updateEditorAction(editor: any): TesterAction {
  return {
    type: UPDATE_EDITOR,
    payload: { editor },
  };
}

export function beginTestAction(): TesterAction {
  return {
    type: BEGIN_TEST,
  };
}

export function finishTestAction(): TesterAction {
  return {
    type: FINISH_TEST,
  };
}

export const error = (message: string) => ({
  type: ERROR,
  message,
});
