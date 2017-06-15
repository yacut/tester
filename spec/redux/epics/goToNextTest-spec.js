'use babel';

import { getEpicActions, state, messages } from '../../common';
import goToNextTestEpic from '../../../lib/redux/epics/goToNextTest';
import * as actions from '../../../lib/redux/actions';

describe('goToNextTestEpic', () => {
  it('dispatches nothing when no messages', async () => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions with first message when the current message not set', async () => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    const expectedOutputActions = [actions.setCurrentMessageAction(messages[0])];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions with second message when the current message is first', async () => {
    const currentState = Object.assign({}, state);
    const firstMessage = Object.assign({}, messages[0]);
    firstMessage.state = 'passed';
    const secondMessage = Object.assign({}, messages[0]);
    secondMessage.state = 'failed';

    currentState.messages = [firstMessage, secondMessage];
    currentState.currentMessage = firstMessage;

    const expectedOutputActions = [actions.setCurrentMessageAction(secondMessage)];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions when there is an error', async () => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    const errorMessage = 'some error';
    spyOn(actions, 'setCurrentMessageAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(goToNextTestEpic, actions.goToNextTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
