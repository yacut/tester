'use babel';

import { TextBuffer, TextEditor } from 'atom';
import { getEpicActions, messages, sleep, state } from '../../common';
import setEditorEpic from '../../../lib/redux/epics/setEditor';
import * as actions from '../../../lib/redux/actions';

describe('setEditorEpic', () => {
  let textEditor;
  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some text' });
    textEditor = new TextEditor({ buffer, largeFileMode: true });
    textEditor.setPath(messages[0].filePath);
  });

  xit('dispatches the correct actions when it is successful', async () => {
    const currentState = Object.assign({}, state);
    currentState.messages = messages;
    currentState.testers = [{ scopes: [textEditor.getPath()] }];
    const expectedOutputActions = [actions.updateEditorAction(textEditor)];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(textEditor), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches nothing when not in scope', async () => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(textEditor));
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches nothing when no editor in action', async () => {
    const expectedOutputActions = [];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(null));
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });

  it('dispatches the correct actions when there is an error', async () => {
    const errorMessage = 'some error';
    spyOn(actions, 'updateEditorAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(messages[0]));
    await sleep(1);
    expect(actualOutputActions).toEqual(expectedOutputActions);
  });
});
