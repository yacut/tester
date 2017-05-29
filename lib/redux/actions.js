'use babel';

/* @flow*/
import type {
  Message,
  TesterAction,
} from '../types';

/*
 * action types
 */
export const RUN_TEST = 'tester/runTest';
export const RUN_PROJECT_TEST = 'tester/runProjectTest';
export const STOP_TEST = 'tester/stopTest';
export const UPDATE_MESSAGES = 'tester/updateMessages';
export const UPDATE_OUTPUT = 'tester/updateOutput';
export const UPDATE_EDITOR = 'tester/updateEditor';
export const INCREASE_COUNTER = 'tester/increaseCounter';
export const DECREASE_COUNTER = 'tester/decreaseCounter';
export const CLEAR_CONSOLE = 'tester/clearConsole';
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

export function increaseCounterAction(): TesterAction {
  return {
    type: INCREASE_COUNTER,
  };
}

export function decreaseCounterAction(): TesterAction {
  return {
    type: DECREASE_COUNTER,
  };
}

export const error = (message: string) => ({
  type: ERROR,
  message,
});
