'use babel';

/* @flow*/
import type { TextEditor } from 'atom';
import { Observable } from 'rxjs';
import { UPDATE_EDITOR, errorAction, testAction } from '../actions';
import { observableFromSubscribeFunction } from './../../helpers';
import type { TesterAction } from '../../types';

// TODO rewrite function with promises and integrate to observable
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

export default function updateEditor(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(UPDATE_EDITOR)
    .switchMap((action: TesterAction) => {
      if (action.payload && action.payload.editor) {
        const textEditor: TextEditor = action.payload.editor;
        handleGutter(textEditor);
        let subscription = Observable.empty();
        if (atom.config.get('tester.testOnSave') && textEditor) {
          subscription = observableFromSubscribeFunction(callback => textEditor.onDidSave(callback)).mapTo(testAction());
        }
        if (atom.config.get('tester.testOnOpen')) {
          subscription = Observable.concat(
           Observable.of(testAction()),
           subscription,
         );
        }
        return subscription;
      }
      return Observable.empty();
    })
    .catch(err => Observable.of(errorAction(err)));
}
