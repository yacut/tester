'use babel';

import { TextBuffer, TextEditor } from 'atom';
import { asyncTest, getEpicActions, state } from '../../common';
import updateMessagesEpic from '../../../lib/redux/epics/updateMessages';
import * as actions from '../../../lib/redux/actions';
import * as decorateManager from '../../../lib/decorate-manager';

describe('updateMessagesEpic', () => {
  let currentState;
  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some text' });
    currentState = Object.assign({}, state);
    currentState.editor = new TextEditor({ buffer, largeFileMode: true });
  });
  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    spyOn(decorateManager, 'clearDecoratedGutter').andCallFake(() => Promise.resolve());
    spyOn(decorateManager, 'decorateGutter').andCallFake(() => Promise.resolve());
    spyOn(decorateManager, 'clearInlineMessages').andCallFake(() => Promise.resolve());
    spyOn(decorateManager, 'setInlineMessages').andCallFake(() => Promise.resolve());
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(updateMessagesEpic, actions.updateMessagesAction(), currentState);

    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(await decorateManager.clearDecoratedGutter).toHaveBeenCalled();
    expect(await decorateManager.decorateGutter).toHaveBeenCalled();
    expect(await decorateManager.clearInlineMessages).toHaveBeenCalled();
    expect(await decorateManager.setInlineMessages).toHaveBeenCalled();
    done();
  }));
});
