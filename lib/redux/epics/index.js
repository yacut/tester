'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import decreaseCounterEpic from './decreaseCounter';
import increaseCounterEpic from './increaseCounter';
import updateMessagesEpic from './updateMessages';
import updateOutputEpic from './updateOutput';
import updateEditorEpic from './updateEditor';

export default () => combineEpics(
  decreaseCounterEpic,
  increaseCounterEpic,
  updateMessagesEpic,
  updateOutputEpic,
  updateEditorEpic,
);
