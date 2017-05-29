'use babel';

/* @flow*/

import { combineReducers } from 'redux';
import type {
  TesterAction,
  TesterResultState,
} from '../types';

import {
  DECREASE_COUNTER,
  INCREASE_COUNTER,
  UPDATE_MESSAGES,
  SORT_BY_COLUMN,
} from './actions';

function results(state: TesterResultState={ messages: [], output: '', counter: 0 }, action: TesterAction): ?TesterResultState {
  switch (action.type) {
    case DECREASE_COUNTER:
      return Object.assign({}, state, {
        counter: state.counter - 1,
      });
    case INCREASE_COUNTER:
      return Object.assign({}, state, {
        counter: state.counter + 1,
      });
    case UPDATE_MESSAGES:
      console.log('update messages reducer', state, action);
      return Object.assign({}, state, {
        messages: (action.payload && action.payload.messages ? action.payload.messages : []),
      });
    default: return state;
  }
}

function sortSetting(state, action) {
  switch (action.type) {
    case SORT_BY_COLUMN:
      return action.sortBy;
    default:
      return state;
  }
}
export default combineReducers({
  results,
  // sortSetting,
});
