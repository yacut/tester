'use babel';

/* @flow*/

// import { combineReducers } from 'redux';
import type {
  TesterAction,
  TesterState,
} from '../types';

import {
  ERROR,
  BEGIN_TEST,
  FINISH_TEST,
  UPDATE_MESSAGES,
  UPDATE_OUTPUT,
  UPDATE_EDITOR,
  // SORT_BY_COLUMN,
} from './actions';

export default function (
  state: TesterState={
    messages: [],
    output: '',
    testRunning: false,
    editor: null,
    sort: { byKey: '', desc: false },
    filter: { pattern: '', currentFileOnly: false },
  },
  action: TesterAction): ?TesterState {
  console.log('reducer', state, action);
  switch (action.type) {
    case BEGIN_TEST:
      return Object.assign({}, state, {
        testRunning: true,
      });
    case FINISH_TEST:
      return Object.assign({}, state, {
        testRunning: false,
      });
    case UPDATE_MESSAGES:
      return Object.assign({}, state, {
        messages: (action.payload && action.payload.messages ? action.payload.messages : []),
      });
    case UPDATE_OUTPUT:
      return Object.assign({}, state, {
        output: (action.payload && action.payload.output ? action.payload.output : ''),
      });
    case UPDATE_EDITOR:
      return Object.assign({}, state, {
        editor: (action.payload && action.payload.editor ? action.payload.editor : null),
      });
    case ERROR:
      return Object.assign({}, state, {
        output: action.errorMessage,
      });
    default: return state;
  }
}

// function sortSetting(state, action) {
//   switch (action.type) {
//     case SORT_BY_COLUMN:
//       return action.sortBy;
//     default:
//       return state;
//   }
// }
// export default combineReducers({
//   results,
//   // sortSetting,
// });
