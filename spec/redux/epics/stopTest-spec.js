'use babel';

import { asyncTest, getEpicActions, state } from '../../common';
import stopTestEpic from '../../../lib/redux/epics/stopTest';
import * as actions from '../../../lib/redux/actions';

describe('stopTestEpic', () => {
  let currentState;
  let testerMock;

  beforeEach(async () => {
    currentState = Object.assign({}, state);
  });

  it('dispatches the correct actions when file test', asyncTest(async (done) => {
    testerMock = jasmine.createSpyObj('tester', ['test', 'stop']);
    currentState.testers = [testerMock];
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(stopTestEpic, actions.stopTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(testerMock.stop).toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    currentState.testers = [{ stop: () => { throw errorMessage; } }];
    spyOn(actions, 'startTestAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(stopTestEpic, actions.stopTestAction(), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
