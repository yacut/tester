'use babel';

/* @flow*/
import type { TextEditor } from 'atom';
import { Observable } from 'rxjs';
import { UPDATE_EDITOR, errorAction, testAction } from '../actions';

function handleGutter(textEditor: TextEditor) {
  if (!textEditor) {
    return null;
  }

  let gutter = textEditor.gutterWithName('tester');
  if (gutter) {
    try {
      gutter.destroy();
      gutter = null;
    } catch (error) {
      console.error('Tester: ', error);
    }
  }

  if (this.gutterEnabled) {
    const position = atom.config.get('tester.gutterPosition');
    if (textEditor && !textEditor.gutter) {
      gutter = textEditor.addGutter({
        name: 'tester',
        priority: position === 'Left' ? -100 : 100,
      });
    }
  }
  return gutter;
}

export default function updateEditor(action$: Observable) {
  return action$.ofType(UPDATE_EDITOR)
    .map((action) => {
      console.log(action);
      const isTextEditor = atom.workspace.isTextEditor(action.payload.editor);
      if (isTextEditor) {
        handleGutter(action.payload.editor);
      }
      if (atom.config.get('tester.testOnOpen')) {
        return Observable.of(testAction());
      }

      return Observable.empty();
    })
    .catch(err => Observable.of(errorAction(err)));
}
