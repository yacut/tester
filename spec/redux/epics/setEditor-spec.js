'use babel';

import { TextBuffer, TextEditor } from 'atom';
import { asyncTest, getEpicActions, passedTest, state } from '../../common';
import setEditorEpic from '../../../lib/redux/epics/setEditor';
import * as actions from '../../../lib/redux/actions';

describe('setEditorEpic', () => {
  let textEditor;
  let currentState;
  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some text' });
    buffer.setPath(passedTest.filePath);
    textEditor = new TextEditor({ buffer, largeFileMode: true });
    currentState = Object.assign({}, state);
    currentState.messages = [Object.assign({}, passedTest)];
    currentState.testers = [{ scopes: ['*'] }];
  });

  it('dispatches the correct actions when it is successful', asyncTest(async (done) => {
    const expectedOutputActions = [actions.updateEditorAction(textEditor)];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(textEditor), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when not in scope', asyncTest(async (done) => {
    currentState.testers = [{ scopes: [] }];
    const expectedOutputActions = [actions.updateEditorAction(null)];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(textEditor), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches nothing when no editor in action', asyncTest(async (done) => {
    const expectedOutputActions = [actions.updateEditorAction(null)];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(null), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));

  it('dispatches the correct actions when there is an error', asyncTest(async (done) => {
    const errorMessage = new Error('some error');
    spyOn(actions, 'updateEditorAction').andCallFake(() => { throw errorMessage; });
    const expectedOutputActions = [actions.errorAction(errorMessage)];
    const actualOutputActions = await getEpicActions(setEditorEpic, actions.setEditorAction(textEditor), currentState);
    expect(actualOutputActions).toEqual(expectedOutputActions);
    done();
  }));
});
