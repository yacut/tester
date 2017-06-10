'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import errorEpic from './error';
import setEditorEpic from './setEditor';
import setFilterEpic from './setFilter';
import setSortByEpic from './setSortBy';
import startTestEpic from './startTest';
import stopTestEpic from './stopTest';
import testEpic from './test';
import testLastEpic from './testLast';
import testProjectEpic from './testProject';
import transformMessagesEpic from './transformMessages';
import updateEditorEpic from './updateEditor';
import updateMessagesEpic from './updateMessages';
import updateOutputEpic from './updateOutput';

export default (...args: any) => combineEpics(
  errorEpic,
  setEditorEpic,
  setFilterEpic,
  setSortByEpic,
  startTestEpic,
  stopTestEpic,
  testEpic,
  testLastEpic,
  testProjectEpic,
  transformMessagesEpic,
  updateEditorEpic,
  updateMessagesEpic,
  updateOutputEpic,
)(...args);
