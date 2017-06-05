'use babel';

/* @flow*/
import type { TextEditor } from 'atom';
import { Observable } from 'rxjs';
import { UPDATE_EDITOR, errorAction, testAction } from '../actions';
import type { Store } from '../../types';

function handleGutter(textEditor: TextEditor) {
  if (!textEditor) {
    return;
  }
  const isTextEditor = atom.workspace.isTextEditor(textEditor);
  if (!isTextEditor) {
    return;
  }

  let gutter = textEditor.gutterWithName('tester');
  if (gutter && !atom.config.get('tester.gutterEnabled')) {
    try {
      gutter.destroy();
      gutter = null;
    } catch (error) {
      console.error('Tester: ', error);
    }
  }

  if (!gutter && atom.config.get('tester.gutterEnabled')) {
    const position = atom.config.get('tester.gutterPosition');
    gutter = textEditor.addGutter({
      name: 'tester',
      priority: position === 'Left' ? -100 : 100,
    });
  }
}

export default function updateEditor(action$: Observable, store: Store) {
  return action$.ofType(UPDATE_EDITOR)
    .switchMap((action) => {
      handleGutter(action.payload.editor);
      if (!atom.config.get('tester.testOnOpen')) {
        return Observable.empty();
      }
      return Observable.of(testAction());
    })
    .catch(err => Observable.of(errorAction(err)));
}
