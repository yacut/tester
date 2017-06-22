'use babel';

/* @flow*/
import type { TextEditor } from 'atom';
import { Observable } from 'rxjs';
import { UPDATE_EDITOR, errorAction, testAction } from '../actions';
import { observableFromSubscribeFunction } from './../../helpers';
import { handleGutter } from '../../decorate-manager';
import type { TesterAction } from '../../types';

export default function updateEditor(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(UPDATE_EDITOR)
    .switchMap((action: TesterAction) => {
      if (action.payload && action.payload.editor) {
        const textEditor: TextEditor = action.payload.editor;
        let subscription = Observable.fromPromise(handleGutter(textEditor)).switchMap(() => Observable.empty());
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
