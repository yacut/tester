'use babel';

import { asyncTest, getEpicActions, state, failedTest } from '../../common';
import goToPreviousTestEpic from '../../../lib/redux/epics/goToPreviousTest';
import * as actions from '../../../lib/redux/actions';

describe('goToPreviousTestEpic', () => {
  it('dispatches nothing when no messages', asyncTest(async (done) => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions with last message when the current message not set', asyncTest(async (done) => {
    const currentState = Object.assign({}, state);
    currentState.messages = [failedTest];
    const expectedOutputActions = [actions.setCurrentMessageAction(failedTest)];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions with fist message when the current message is second', asyncTest(async (done) => {
    const currentState = Object.assign({}, state);
    const firstMessage = Object.assign({}, failedTest);
    firstMessage.lineNumber = '1';
    const secondMessage = Object.assign({}, failedTest);
    secondMessage.lineNumber = '2';

    currentState.messages = [firstMessage, secondMessage];
    currentState.currentMessage = secondMessage;

    const expectedOutputActions = [actions.setCurrentMessageAction(firstMessage)];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const currentState = Object.assign({}, state);
    currentState.messages = [failedTest];
    const errorMessage = 'some error';
    spyOn(actions, 'setCurrentMessageAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
