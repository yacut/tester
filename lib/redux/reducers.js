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
  UPDATE_OUTPUT,
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
      return Object.assign({}, state, {
        messages: (action.payload && action.payload.messages ? action.payload.messages : []),
      });
    case UPDATE_OUTPUT:
      return Object.assign({}, state, {
        output: (action.payload && action.payload.output ? action.payload.output : ''),
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
