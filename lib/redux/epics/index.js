'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import addTesterEpic from './addTester';
import errorEpic from './error';
import filterMessagesEpic from './filterMessages';
import removeTesterEpic from './removeTester';
import sortMessagesEpic from './sortMessages';
import startTestEpic from './startTest';
import stopTestEpic from './stopTest';
import testEpic from './test';
import testLastEpic from './testLast';
import testProjectEpic from './testProject';
import updateMessagesEpic from './updateMessages';
import updateOutputEpic from './updateOutput';
import updateEditorEpic from './updateEditor';

export default (...args: any) => combineEpics(
  addTesterEpic,
  errorEpic,
  filterMessagesEpic,
  removeTesterEpic,
  sortMessagesEpic,
  startTestEpic,
  stopTestEpic,
  testEpic,
  testLastEpic,
  testProjectEpic,
  updateMessagesEpic,
  updateOutputEpic,
  updateEditorEpic,
)(...args);
