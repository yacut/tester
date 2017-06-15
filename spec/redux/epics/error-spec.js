'use babel';

import { getEpicActions } from '../../common';
import errorEpic from '../../../lib/redux/epics/error';
import * as actions from '../../../lib/redux/actions';

describe('errorEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    spyOn(atom.notifications, 'addError');
    spyOn(console, 'error');
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(errorEpic, actions.errorAction(new Error('some error')));
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(atom.notifications.addError).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
