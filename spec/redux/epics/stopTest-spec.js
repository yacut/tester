'use babel';

import { asyncTest, getEpicActions, state, sampleTester } from '../../common';
import stopTestEpic from '../../../lib/redux/epics/stopTest';
import * as actions from '../../../lib/redux/actions';

describe('stopTestEpic', () => {
  let currentState;

  beforeEach(async () => {
    currentState = Object.assign({}, state);
  });

  it('dispatches the correct actions when file test', asyncTest(async (done) => {
    spyOn(sampleTester, 'stop').andCallFake(() => Promise.resolve());
    currentState.testers = [sampleTester];
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(stopTestEpic, actions.stopTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(sampleTester.stop).toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(sampleTester, 'stop').andCallFake(() => { throw errorMessage; });
    currentState.testers = [sampleTester];
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(stopTestEpic, actions.stopTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
