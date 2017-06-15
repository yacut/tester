'use babel';

import { getEpicActions } from '../../common';
import errorEpic from '../../../lib/redux/epics/clear';
import * as actions from '../../../lib/redux/actions';

describe('errorEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(errorEpic, actions.errorAction(new Error('some error')));
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
