'use babel';

import { getEpicActions } from '../../common';
import setSortByEpic from '../../../lib/redux/epics/setSortBy';
import * as actions from '../../../lib/redux/actions';

describe('setSortByEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    const expectedOutputActions = [actions.transformMessagesAction()];
    const actualOutputActions = await getEpicActions(setSortByEpic, actions.setSortByAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions when there is an error', async () => {
    const errorMessage = 'some error';
    spyOn(actions, 'transformMessagesAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setSortByEpic, actions.setSortByAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
