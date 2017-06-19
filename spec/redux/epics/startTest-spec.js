'use babel';

import { asyncTest, getEpicActions, state, sampleTester, passedTest, failedTest, getTextEditor } from '../../common';
import startTestEpic from '../../../lib/redux/epics/startTest';
import * as actions from '../../../lib/redux/actions';

describe('startTestEpic', () => {
  let currentState;
  const output = 'some console output';

  beforeEach(async () => {
    currentState = Object.assign({}, state);
    currentState.testers = [sampleTester];
  });

  it('dispatches the correct actions when not project test and no editor set', asyncTest(async (done) => {
    currentState.editor = null;
    spyOn(sampleTester, 'test');
    const expectedOutputActions = [actions.finishTestAction()];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).not.toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when not project test and no file set', asyncTest(async (done) => {
    currentState.editor = getTextEditor(null, '');
    spyOn(sampleTester, 'test');
    const expectedOutputActions = [actions.finishTestAction()];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).not.toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when not project test and file set but modified', asyncTest(async (done) => {
    currentState.editor = getTextEditor(null, passedTest.filePath);
    spyOn(sampleTester, 'test');
    spyOn(currentState.editor, 'isModified').andCallFake(() => true);
    const expectedOutputActions = [actions.finishTestAction()];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).not.toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when project test', asyncTest(async (done) => {
    const messages = [Object.assign({}, passedTest)];
    spyOn(sampleTester, 'test').andCallFake(() => Promise.resolve({ messages, output }));
    const expectedOutputActions = [
      actions.transformMessagesAction(messages),
      actions.updateOutputAction(output),
      actions.finishTestAction()];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(true), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when project test and remove filter setting', asyncTest(async (done) => {
    atom.config.set('tester.removeCurrentFileFilterIfProjectTest', true);
    currentState.currentFileOnly = true;
    const messages = [Object.assign({}, passedTest)];
    spyOn(sampleTester, 'test').andCallFake(() => Promise.resolve({ messages, output }));
    const expectedOutputActions = [
      actions.setFilterAction(false),
      actions.transformMessagesAction(messages),
      actions.updateOutputAction(output),
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(true), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when project test and no console output', asyncTest(async (done) => {
    const messages = [Object.assign({}, passedTest)];
    spyOn(sampleTester, 'test').andCallFake(() => Promise.resolve({ messages, output: '' }));
    currentState.additionalArgs = '--some-arg';
    const expectedOutputActions = [
      actions.transformMessagesAction(messages),
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(true), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when project test and no messages', asyncTest(async (done) => {
    spyOn(sampleTester, 'test').andCallFake(() => Promise.resolve({ messages: [], output }));
    const expectedOutputActions = [
      actions.updateOutputAction(output),
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(true), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when project test, state messages and tester messages', asyncTest(async (done) => {
    const stateMessages = [Object.assign({}, passedTest)];
    const testerMessages = [Object.assign({}, failedTest)];
    currentState.rawMessages = stateMessages;
    spyOn(sampleTester, 'test').andCallFake(() => Promise.resolve({ messages: testerMessages, output }));
    const expectedOutputActions = [
      actions.transformMessagesAction([passedTest, failedTest]),
      actions.updateOutputAction(output),
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(true), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when file test and in scope', asyncTest(async (done) => {
    currentState.editor = getTextEditor(null, passedTest.filePath);
    const messages = [Object.assign({}, passedTest)];
    spyOn(sampleTester, 'test').andCallFake(() => Promise.resolve({ messages, output }));
    sampleTester.scopes = ['**'];
    const expectedOutputActions = [
      actions.transformMessagesAction(messages),
      actions.updateOutputAction(output),
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(false), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).toHaveBeenCalledWith(currentState.editor, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when file test and not in scope', asyncTest(async (done) => {
    currentState.editor = getTextEditor(null, passedTest.filePath);
    spyOn(sampleTester, 'test');
    sampleTester.scopes = ['some non scope regex'];
    const expectedOutputActions = [
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(false), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).not.toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when project test and two testers', asyncTest(async (done) => {
    const firstTester = Object.assign({}, sampleTester);
    const secondTester = Object.assign({}, sampleTester);
    currentState.testers = [firstTester, secondTester];
    const firstTesterMessages = [Object.assign({}, passedTest)];
    const secondTesterMessages = [Object.assign({}, failedTest)];

    spyOn(firstTester, 'test').andCallFake(() => Promise.resolve({ messages: firstTesterMessages, output: 'first' }));
    spyOn(secondTester, 'test').andCallFake(() => Promise.resolve({ messages: secondTesterMessages, output: 'second' }));
    const expectedOutputActions = [
      actions.transformMessagesAction([passedTest, failedTest]),
      actions.updateOutputAction('firstsecond'),
      actions.finishTestAction(),
    ];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(true), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(firstTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    expect(secondTester.test).toHaveBeenCalledWith(null, currentState.additionalArgs);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    currentState.editor = getTextEditor();
    spyOn(currentState.editor, 'getPath').andCallFake(() => { throw errorMessage; });
    spyOn(sampleTester, 'test');
    const expectedOutputActions = [actions.errorAction(errorMessage), actions.stopTestAction()];
    const actualOutputActions = await getEpicActions(startTestEpic, actions.startTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.test).not.toHaveBeenCalled();
    done();
  }));
});
