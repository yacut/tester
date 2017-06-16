'use babel';

import { getEpicActions } from '../../common';
import updateOutputEpic from '../../../lib/redux/epics/updateOutput';
import * as actions from '../../../lib/redux/actions';

describe('updateOutputEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(updateOutputEpic, actions.updateOutputAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
