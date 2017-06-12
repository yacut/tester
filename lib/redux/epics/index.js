'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import clearEpic from './clear';
import errorEpic from './error';
import goToNextTestEpic from './goToNextTest';
import goToPreviousTestEpic from './goToPreviousTest';
import setCurrentMessageEpic from './setCurrentMessage';
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
  clearEpic,
  errorEpic,
  goToNextTestEpic,
  goToPreviousTestEpic,
  setCurrentMessageEpic,
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
