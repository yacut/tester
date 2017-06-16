'use babel';

import { asyncTest, getEpicActions, state, messages } from '../../common';
import goToNextTestEpic from '../../../lib/redux/epics/goToNextTest';
import * as actions from '../../../lib/redux/actions';

describe('goToNextTestEpic', () => {
  it('dispatches nothing when no messages', asyncTest(async (done) => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions with first message when the current message not set', asyncTest(async (done) => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    const expectedOutputActions = [actions.setCurrentMessageAction(messages[0])];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions with second message when the current message is first', asyncTest(async (done) => {
    const currentState = Object.assign({}, state);
    const firstMessage = Object.assign({}, messages[0]);
    firstMessage.lineNumber = '1';
    const secondMessage = Object.assign({}, messages[0]);
    secondMessage.lineNumber = '2';

    currentState.messages = [firstMessage, secondMessage];
    currentState.currentMessage = firstMessage;

    const expectedOutputActions = [actions.setCurrentMessageAction(secondMessage)];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    const errorMessage = 'some error';
    spyOn(actions, 'setCurrentMessageAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
