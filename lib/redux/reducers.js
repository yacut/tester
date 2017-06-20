'use babel';

/* @flow*/

// import { combineReducers } from 'redux';
import type {
  TesterAction,
  TesterState,
} from '../types';

import {
  ADD_TESTER,
  ERROR,
  FINISH_TEST,
  REMOVE_TESTER,
  SET_ADDITIONAL_ARGS,
  SET_FILTER,
  SET_SORTBY,
  SET_CURRENT_MESSAGE,
  START_TEST,
  STOP_TEST,
  UPDATE_EDITOR,
  UPDATE_MESSAGES,
  UPDATE_OUTPUT,
} from './actions';

export default function (
  state: TesterState = {
    rawMessages: [],
    currentFileOnly: false,
    currentMessage: null,
    messages: [],
    output: '',
    testRunning: false,
    editor: null,
    isProjectTest: false,
    sorter: { key: '', desc: false },
    testers: [],
    additionalArgs: '',
  },
  action: TesterAction): ?TesterState {
  switch (action.type) {

    case ADD_TESTER:
      if (action.payload && action.payload.tester) {
        if (!state.testers) {
          state.testers = [];
        }
        state.testers.push(action.payload.tester);
      }
      return state;
    case REMOVE_TESTER:
      if (action.payload && action.payload.tester) {
        const index = state.testers.indexOf(action.payload.tester);
        state.testers.splice(index, 1);
      }
      return state;

    case START_TEST:
      return Object.assign({}, state, {
        isProjectTest: action.payload && action.payload.isProjectTest ? action.payload.isProjectTest : false,
        testRunning: true,
      });
    case STOP_TEST:
      return Object.assign({}, state, {
        testRunning: false,
      });
    case FINISH_TEST:
      return Object.assign({}, state, {
        testRunning: false,
      });

    case SET_FILTER:
      return Object.assign({}, state, {
        currentFileOnly: action.payload && action.payload.currentFileOnly !== null ? action.payload.currentFileOnly : state.currentFileOnly,
      });
    case SET_SORTBY:
      return Object.assign({}, state, {
        sorter: action.payload && action.payload.sorter ? action.payload.sorter : { key: '', desc: false },
      });
    case SET_ADDITIONAL_ARGS:
      return Object.assign({}, state, {
        additionalArgs: action.payload && action.payload.additionalArgs ? action.payload.additionalArgs : '',
      });
    case SET_CURRENT_MESSAGE:
      return Object.assign({}, state, {
        currentMessage: action.payload && action.payload.currentMessage ? action.payload.currentMessage : null,
      });

    case UPDATE_EDITOR:
      return Object.assign({}, state, {
        editor: (action.payload && action.payload.editor ? action.payload.editor : null),
      });
    case UPDATE_MESSAGES:
      return Object.assign({}, state, {
        messages: (action.payload && action.payload.messages ? action.payload.messages : state.messages),
        rawMessages: (action.payload && action.payload.rawMessages ? action.payload.rawMessages : state.rawMessages),
      });
    case UPDATE_OUTPUT:
      return Object.assign({}, state, {
        output: (action.payload && action.payload.output ? action.payload.output : ''),
      });

    case ERROR:
      return Object.assign({}, state, {
        output: action.error ? action.error.message : '',
      });
    default: return state;
  }
}
