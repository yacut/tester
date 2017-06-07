'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import errorEpic from './error';
import filterMessagesEpic from './filterMessages';
import sortMessagesEpic from './sortMessages';
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
  filterMessagesEpic,
  sortMessagesEpic,
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
