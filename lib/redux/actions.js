'use babel';

/* @flow*/
import type { TextEditor } from 'atom';
import type {
  Message,
  Tester,
  TesterAction,
  TesterSorter,
} from '../types';

/*
 * action types
 */

export const ADD_TESTER = 'tester/addTester';
export const CLEAR = 'tester/clear';
export const ERROR = 'tester/error';
export const GO_TO_NEXT_TEST = 'tester/goToNextTest';
export const GO_TO_PREVIOUS_TEST = 'tester/goToPreviousTest';
export const SET_CURRENT_MESSAGE = 'tester/setCurrentMessage';
export const FINISH_TEST = 'tester/finishTest';
export const REMOVE_TESTER = 'tester/removeTester';
export const SET_ADDITIONAL_ARGS = 'tester/setAdditionalArgs';
export const SET_EDITOR = 'tester/setEditor';
export const SET_FILTER = 'tester/setFilter';
export const SET_SORTBY = 'tester/setSortBy';
export const START_TEST = 'tester/startTest';
export const STOP_TEST = 'tester/stopTest';
export const TEST = 'tester/test';
export const TEST_LAST = 'tester/testLast';
export const TEST_PROJECT = 'tester/testProject';
export const TRANSFORM_MESSAGES = 'tester/transformMessages';
export const UPDATE_EDITOR = 'tester/updateEditor';
export const UPDATE_MESSAGES = 'tester/updateMessages';
export const UPDATE_OUTPUT = 'tester/updateOutput';

/*
 * action creators
 */

export function addTesterAction(tester: Tester): TesterAction {
  return {
    type: ADD_TESTER,
    payload: { tester },
  };
}

export function clearAction(): TesterAction {
  return {
    type: CLEAR,
  };
}

export function errorAction(message: any): TesterAction {
  return {
    type: ERROR,
    error: message,
  };
}

export function goToNextTestAction(): TesterAction {
  return {
    type: GO_TO_NEXT_TEST,
  };
}

export function goToPreviousTestAction(): TesterAction {
  return {
    type: GO_TO_PREVIOUS_TEST,
  };
}

export function setAdditionalArgsAction(additionalArgs: ?string): TesterAction {
  return {
    type: SET_ADDITIONAL_ARGS,
    payload: { additionalArgs },
  };
}

export function setCurrentMessageAction(currentMessage: Message): TesterAction {
  return {
    type: SET_CURRENT_MESSAGE,
    payload: { currentMessage },
  };
}

export function setEditorAction(editor: TextEditor): TesterAction {
  return {
    type: SET_EDITOR,
    payload: { editor },
  };
}

export function setFilterAction(currentFileOnly: ?boolean): TesterAction {
  return {
    type: SET_FILTER,
    payload: { currentFileOnly },
  };
}

export function finishTestAction(): TesterAction {
  return {
    type: FINISH_TEST,
  };
}

export function removeTesterAction(tester: Tester): TesterAction {
  return {
    type: REMOVE_TESTER,
    payload: { tester },
  };
}

export function setSortByAction(sorter: TesterSorter): TesterAction {
  return {
    type: SET_SORTBY,
    payload: { sorter },
  };
}

export function startTestAction(isProjectTest: ?boolean): TesterAction {
  return {
    type: START_TEST,
    payload: { isProjectTest },
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

export function transformMessagesAction(rawMessages: ?Array<Message>): TesterAction {
  return {
    type: TRANSFORM_MESSAGES,
    payload: { rawMessages },
  };
}

export function updateEditorAction(editor: TextEditor): TesterAction {
  return {
    type: UPDATE_EDITOR,
    payload: { editor },
  };
}

export function updateMessagesAction(messages: Array<Message>, rawMessages: ?Array<Message>): TesterAction {
  return {
    type: UPDATE_MESSAGES,
    payload: { messages, rawMessages },
  };
}

export function updateOutputAction(output: string): TesterAction {
  return {
    type: UPDATE_OUTPUT,
    payload: { output },
  };
}
