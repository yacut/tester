'use babel';

/* @flow*/

import { combineReducers } from 'redux';
import type {
  TesterAction,
  TesterState,
} from '../types';

import { UPDATE_MESSAGES, SORT_BY_COLUMN } from './actions';

function results(state: TesterState={ messages: [], output: '' }, action: TesterAction): ?TesterState {
  switch (action.type) {
    case UPDATE_MESSAGES:
      console.log('update messages reducer', state, action);
      return {
        ...state,
        messages: (action.payload && action.payload.messages ? action.payload.messages : []),
      };
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
