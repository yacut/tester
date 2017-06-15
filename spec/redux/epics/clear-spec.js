'use babel';

import { getEpicActions } from '../../common';
import clearEpic from '../../../lib/redux/epics/clear';
import * as actions from '../../../lib/redux/actions';

describe('clearEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    const expectedOutputActions = [actions.updateMessagesAction([], []), actions.updateOutputAction('')];
    const actualOutputActions = await getEpicActions(clearEpic, actions.clearAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions when there is an error', async () => {
    const errorMessage = 'some error';
    spyOn(actions, 'updateOutputAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(clearEpic, actions.clearAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
