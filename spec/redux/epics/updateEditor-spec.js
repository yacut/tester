'use babel';

import { TextBuffer, TextEditor } from 'atom';
import { Observable } from 'rxjs';
import { ActionsObservable } from 'redux-observable';
import { asyncTest, getEpicActions, state, getFixturesPath } from '../../common';
import updateEditorEpic from '../../../lib/redux/epics/updateEditor';
import * as actions from '../../../lib/redux/actions';
import * as decorateManager from '../../../lib/decorate-manager';

describe('updateEditorEpic', () => {
  let currentState;
  let textEditor;
  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some test file' });
    currentState = Object.assign({}, state);
    textEditor = new TextEditor({ buffer, largeFileMode: true });
  });
  it('dispatches no actions when testOnOpen and testOnSave disabled', asyncTest(async (done) => {
    atom.config.set('tester.testOnOpen', false);
    atom.config.set('tester.testOnSave', false);
    spyOn(decorateManager, 'handleGutter').andCallFake(() => Promise.resolve());
    // FIXME undefined
    const expectedOutputActions = [undefined];
    const actualOutputActions = await getEpicActions(updateEditorEpic, actions.updateEditorAction(textEditor), currentState);

    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(await decorateManager.handleGutter).toHaveBeenCalled();
    done();
  }));
  it('dispatches the correct actions when testOnOpen enabled', asyncTest(async (done) => {
    atom.config.set('tester.testOnOpen', true);
    atom.config.set('tester.testOnSave', false);
    spyOn(decorateManager, 'handleGutter').andCallFake(() => Promise.resolve());
    const expectedOutputActions = [actions.testAction(), undefined];
    const actualOutputActions = await getEpicActions(updateEditorEpic, actions.updateEditorAction(textEditor), currentState);

    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(await decorateManager.handleGutter).toHaveBeenCalled();
    done();
  }));
  it('dispatches the correct actions when testOnOpen enabled  and testOnSave disabled', asyncTest(async (done) => {
    atom.config.set('tester.testOnOpen', true);
    atom.config.set('tester.testOnSave', false);
    spyOn(decorateManager, 'handleGutter').andCallFake(() => Promise.resolve());
    const expectedOutputActions = [actions.testAction()];
    const action$ = new ActionsObservable(Observable.of(actions.updateEditorAction(textEditor)));
    const actualOutputActions = [];
    updateEditorEpic(action$).subscribe(action => actualOutputActions.push(action));
    textEditor.saveAs(getFixturesPath());

    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(await decorateManager.handleGutter).toHaveBeenCalled();
    done();
  }));
  it('dispatches the correct actions when testOnOpen and testOnSave enabled', asyncTest(async (done) => {
    atom.config.set('tester.testOnOpen', true);
    atom.config.set('tester.testOnSave', true);
    spyOn(decorateManager, 'handleGutter').andCallFake(() => Promise.resolve());
    const expectedOutputActions = [actions.testAction(), actions.testAction()];
    const action$ = new ActionsObservable(Observable.of(actions.updateEditorAction(textEditor)));
    const actualOutputActions = [];
    updateEditorEpic(action$).subscribe(action => actualOutputActions.push(action));
    textEditor.saveAs(getFixturesPath());

    expect(actualOutputActions).toEqual(expectedOutputActions);
    expect(await decorateManager.handleGutter).toHaveBeenCalled();
    done();
  }));
});
