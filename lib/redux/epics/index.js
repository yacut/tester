'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import decreaseCounter from './decreaseCounter';
import increaseCounter from './increaseCounter';
import updateMessagesEpic from './updateMessages';

export default () => combineEpics(
  decreaseCounter,
  increaseCounter,
  updateMessagesEpic,
);
