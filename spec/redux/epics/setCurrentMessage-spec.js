'use babel';

import { asyncTest, getEpicActions, passedTest } from '../../common';
import setCurrentMessageEpic from '../../../lib/redux/epics/setCurrentMessage';
import * as actions from '../../../lib/redux/actions';

describe('setCurrentMessageEpic', () => {
  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    spyOn(atom.workspace, 'open').andCallFake(() => new Promise((resolve) => { resolve(); }));
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(setCurrentMessageEpic, actions.setCurrentMessageAction(passedTest));
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(atom.workspace.open).toHaveBeenCalledWith(passedTest.filePath, { initialLine: passedTest.lineNumber });
    done();
  }));

  it('dispatches nothing when no current message', asyncTest(async (done) => {
    spyOn(atom.workspace, 'open');
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(setCurrentMessageEpic, actions.setCurrentMessageAction());
    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(atom.workspace.open).not.toHaveBeenCalled();
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = 'some error';
    spyOn(atom.workspace, 'open').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setCurrentMessageEpic, actions.setCurrentMessageAction(passedTest));
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
