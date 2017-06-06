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
      const textEditor = action.payload.editor;
      const currentState = store.getState();
      handleGutter(textEditor);
      let subscription = Observable.empty();
      if (atom.config.get('tester.testOnSave')) {
        subscription = Observable.concat(
           subscription,
           Observable.create((observer) => {
             const disposable = textEditor.onDidSave(observer.next.bind(observer));
             return () => {
               disposable.dispose();
             };
           }),
          //  Observable.fromEvent(textEditor, 'onDidSave').map(() => testAction()),
         );
      }
      if (!atom.config.get('tester.testOnOpen')) {
        subscription = Observable.concat(
           subscription,
           Observable.of(testAction()),
         );
      }
      return subscription;
    })
    .catch(err => Observable.of(errorAction(err)));
}
