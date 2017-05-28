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
export const UPDATE_STATUS = 'tester/updateStatus';
export const CLEAR_CONSOLE = 'tester/clearConsole';
export const ERROR = 'tester/error';

/*
 * action creators
 */
export function updateStatusAction(
  messages: Array<Message>,
  output: string,
): TesterAction {
  return {
    type: UPDATE_STATUS,
    payload: { messages, output },
  };
}

export const error = (message: string) => ({
  type: ERROR,
  message,
});
