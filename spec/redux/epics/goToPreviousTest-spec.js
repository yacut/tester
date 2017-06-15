'use babel';

import { getEpicActions, state, messages } from '../../common';
import goToPreviousTestEpic from '../../../lib/redux/epics/goToPreviousTest';
import * as actions from '../../../lib/redux/actions';

describe('goToPreviousTestEpic', () => {
  it('dispatches nothing when no messages', async () => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions with last message when the current message not set', async () => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    const expectedOutputActions = [actions.setCurrentMessageAction(messages[0])];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions with fist message when the current message is second', async () => {
    const currentState = Object.assign({}, state);
    const firstMessage = Object.assign({}, messages[0]);
    firstMessage.lineNumber = '1';
    const secondMessage = Object.assign({}, messages[0]);
    secondMessage.lineNumber = '2';

    currentState.messages = [firstMessage, secondMessage];
    currentState.currentMessage = secondMessage;

    const expectedOutputActions = [actions.setCurrentMessageAction(firstMessage)];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions when there is an error', async () => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    const errorMessage = 'some error';
    spyOn(actions, 'setCurrentMessageAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(goToPreviousTestEpic, actions.goToPreviousTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
