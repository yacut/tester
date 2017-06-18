'use babel';

import { asyncTest, getEpicActions, state } from '../../common';
import testLastEpic from '../../../lib/redux/epics/testLast';
import * as actions from '../../../lib/redux/actions';

describe('testLastEpic', () => {
  let currentState;
  beforeEach(async () => {
    currentState = Object.assign({}, state);
  });

  it('dispatches the correct actions when file test', asyncTest(async (done) => {
    currentState.testRunning = false;
    currentState.isProjectTest = false;
    const expectedOutputActions = [actions.startTestAction(false)];
    const actualOutputActions = await getEpicActions(testLastEpic, actions.testLastAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when project test', asyncTest(async (done) => {
    currentState.testRunning = false;
    currentState.isProjectTest = true;
    const expectedOutputActions = [actions.startTestAction(true)];
    const actualOutputActions = await getEpicActions(testLastEpic, actions.testLastAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when test already runnung', asyncTest(async (done) => {
    currentState.testRunning = true;
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(testLastEpic, actions.testLastAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(actions, 'startTestAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(testLastEpic, actions.testLastAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
