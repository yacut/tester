'use babel';

import { asyncTest, getEpicActions } from '../../common';
import setSortByEpic from '../../../lib/redux/epics/setSortBy';
import * as actions from '../../../lib/redux/actions';

describe('setSortByEpic', () => {
  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    const expectedOutputActions = [actions.transformMessagesAction()];
    const actualOutputActions = await getEpicActions(setSortByEpic, actions.setSortByAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(actions, 'transformMessagesAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setSortByEpic, actions.setSortByAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
