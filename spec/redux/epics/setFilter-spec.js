'use babel';

import { getEpicActions } from '../../common';
import setFilterEpic from '../../../lib/redux/epics/setFilter';
import * as actions from '../../../lib/redux/actions';

describe('setFilterEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    const expectedOutputActions = [actions.transformMessagesAction()];
    const actualOutputActions = await getEpicActions(setFilterEpic, actions.setFilterAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions when there is an error', async () => {
    const errorMessage = 'some error';
    spyOn(actions, 'transformMessagesAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setFilterEpic, actions.setFilterAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
