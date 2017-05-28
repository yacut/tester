'use babel';

/* @flow*/
import type {
  Message,
  TesterAction,
} from '../types';

/*
 * action types
 */
export const UPDATE_STATUS = 'tester/action/updateStatus';
export const ERROR = 'tester/action/error';

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
