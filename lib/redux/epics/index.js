'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import updateMessagesEpic from './updateMessages';

export default () => combineEpics(
  updateMessagesEpic,
);
