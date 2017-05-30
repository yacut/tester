'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import errorEpic from './error';
import beginTestEpic from './beginTest';
import finishTestEpic from './finishTest';
import updateMessagesEpic from './updateMessages';
import updateOutputEpic from './updateOutput';
import updateEditorEpic from './updateEditor';

export default () => combineEpics(
  errorEpic,
  beginTestEpic,
  finishTestEpic,
  updateMessagesEpic,
  updateOutputEpic,
  updateEditorEpic,
);
