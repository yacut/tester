'use babel';

import { getEpicActions, messages, sleep } from '../../common';
import setCurrentMessageEpic from '../../../lib/redux/epics/setCurrentMessage';
import * as actions from '../../../lib/redux/actions';

describe('setCurrentMessageEpic', () => {
  it('dispatches the correct actions when it is successful', async () => {
    spyOn(atom.workspace, 'open');
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(setCurrentMessageEpic, actions.setCurrentMessageAction(messages[0]));
    expect(actualOutputActions).toEqual(expectedOutputActions);
    await sleep(1);
    expect(atom.workspace.open).toHaveBeenCalledWith(messages[0].filePath, { initialLine: messages[0].lineNumber });
  });

  it('dispatches nothing when no current message', async () => {
    spyOn(atom.workspace, 'open');
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(setCurrentMessageEpic, actions.setCurrentMessageAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    await sleep(1);
    expect(atom.workspace.open).not.toHaveBeenCalled();
  });

  it('dispatches the correct actions when there is an error', async () => {
    const errorMessage = 'some error';
    spyOn(atom.workspace, 'open').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setCurrentMessageEpic, actions.setCurrentMessageAction(messages[0]));
    await sleep(1);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
