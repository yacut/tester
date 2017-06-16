'use babel';

import { TextBuffer, TextEditor } from 'atom';
import { asyncTest, getEpicActions, passedTest, state } from '../../common';
import testEpic from '../../../lib/redux/epics/test';
import * as actions from '../../../lib/redux/actions';

describe('testEpic', () => {
  let textEditor;
  let currentState;
  beforeEach(async () => {
    const messages = [Object.assign(passedTest)];
    const buffer = new TextBuffer({ text: 'some text' });
    buffer.setPath(messages[0].filePath);
    textEditor = new TextEditor({ buffer, largeFileMode: true });
    currentState = Object.assign({}, state);
    currentState.messages = messages;
    currentState.editor = textEditor;
    currentState.testers = [{ scopes: ['*'] }];
    currentState.testRunning = false;
  });

  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    const expectedOutputActions = [actions.startTestAction(false)];
    const actualOutputActions = await getEpicActions(testEpic, actions.testAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when not in scope', asyncTest(async (done) => {
    currentState.testers = [{ scopes: [] }];
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(testEpic, actions.testAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when no editor in action', asyncTest(async (done) => {
    currentState.editor = null;
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(testEpic, actions.testAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when test already running', asyncTest(async (done) => {
    currentState.testRunning = true;
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(testEpic, actions.testAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(actions, 'startTestAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(testEpic, actions.testAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
