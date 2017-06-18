'use babel';

import { TextBuffer, TextEditor } from 'atom';
import { asyncTest, getEpicActions, state, passedTest, failedTest } from '../../common';
import transformMessagesEpic from '../../../lib/redux/epics/transformMessages';
import * as actions from '../../../lib/redux/actions';

describe('transformMessagesEpic', () => {
  let currentState;
  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some text' });
    // buffer.setPath(passedTest.filePath);
    currentState = Object.assign({}, state);
    currentState.editor = new TextEditor({ buffer, largeFileMode: true });
  });

  it('dispatches the correct actions when no messages', asyncTest(async (done) => {
    currentState.messages = [Object.assign({}, passedTest)];
    currentState.rawMessages = [Object.assign({}, passedTest)];
    const expectedOutputActions = [actions.updateMessagesAction([], [])];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction([]), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when state has same messages', asyncTest(async (done) => {
    currentState.messages = [];
    currentState.rawMessages = [];
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction([]), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when no messages in action but state and sort by state', asyncTest(async (done) => {
    const oldMessages = [Object.assign({}, passedTest), Object.assign({}, failedTest)];
    currentState.rawMessages = oldMessages;
    currentState.sorter.key = 'state';
    currentState.sorter.desc = false;
    currentState.currentFileOnly = false;
    const newMessages = [Object.assign({}, failedTest), Object.assign({}, passedTest)];
    const expectedOutputActions = [actions.updateMessagesAction(newMessages, oldMessages)];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when no messages in action but state and sort by state desc', asyncTest(async (done) => {
    const oldMessages = [Object.assign({}, passedTest), Object.assign({}, failedTest)];
    currentState.rawMessages = oldMessages;
    currentState.sorter.key = 'state';
    currentState.sorter.desc = true;
    currentState.currentFileOnly = false;
    const newMessages = [Object.assign({}, passedTest), Object.assign({}, failedTest)];
    const expectedOutputActions = [actions.updateMessagesAction(newMessages, oldMessages)];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when no messages in state and no sorter', asyncTest(async (done) => {
    currentState.rawMessages = [];
    currentState.sorter.key = '';
    currentState.currentFileOnly = false;
    const newMessages = [Object.assign({}, passedTest), Object.assign({}, failedTest)];
    const expectedOutputActions = [actions.updateMessagesAction(newMessages, newMessages)];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction(newMessages), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when no messages in state and currentFileOnly filter', asyncTest(async (done) => {
    const buffer = new TextBuffer({ text: 'some text' });
    buffer.setPath(passedTest.filePath);
    currentState.editor = new TextEditor({ buffer, largeFileMode: true });
    currentState.rawMessages = [];
    currentState.sorter.key = '';
    currentState.currentFileOnly = true;

    const newMessages = [Object.assign({}, passedTest), Object.assign({}, failedTest)];
    const expectedOutputActions = [actions.updateMessagesAction([Object.assign({}, passedTest)], newMessages)];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction(newMessages), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    currentState.messages = [Object.assign({}, passedTest)];
    currentState.rawMessages = [Object.assign({}, passedTest)];
    const errorMessage = 'some error';
    spyOn(actions, 'updateMessagesAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(transformMessagesEpic, actions.transformMessagesAction([]), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
