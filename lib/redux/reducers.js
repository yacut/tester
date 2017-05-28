'use babel';

/* @flow*/

import { combineReducers } from 'redux';
import type {
  TesterAction,
  TesterState,
} from '../types';

import { UPDATE_STATUS } from './actions';

function tester(state: TesterState={ messages: [], output: '' }, action: TesterAction): TesterState {
  switch (action.type) {
    case UPDATE_STATUS:
      console.log('update reducer', state);
      return state;
    default: return state;
  }
}

export default combineReducers({
  tester,
});
