'use babel';

import { asyncTest, getEpicActions, state } from '../../common';
import testProjectEpic from '../../../lib/redux/epics/testProject';
import * as actions from '../../../lib/redux/actions';

describe('testProjectEpic', () => {
  let currentState;
  beforeEach(async () => {
    currentState = Object.assign({}, state);
  });

  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    currentState.testRunning = false;
    const expectedOutputActions = [actions.startTestAction(true)];
    const actualOutputActions = await getEpicActions(testProjectEpic, actions.testProjectAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when test already runnung', asyncTest(async (done) => {
    currentState.testRunning = true;
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(testProjectEpic, actions.testProjectAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(actions, 'startTestAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(testProjectEpic, actions.testProjectAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
