'use babel';

import { asyncTest, getEpicActions } from '../../common';
import clearEpic from '../../../lib/redux/epics/clear';
import * as actions from '../../../lib/redux/actions';

describe('clearEpic', () => {
  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    const expectedOutputActions = [actions.updateMessagesAction([], []), actions.updateOutputAction('')];
    const actualOutputActions = await getEpicActions(clearEpic, actions.clearAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(actions, 'updateOutputAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(clearEpic, actions.clearAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
