'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import type { TextEditor } from 'atom';
import globToRegex from 'glob-to-regexp';
import { SET_EDITOR, errorAction, updateEditorAction } from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store, TesterAction, Tester, TesterState } from '../../types';

export default function setEditor(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(SET_EDITOR)
    .switchMap((action: TesterAction) => {
      const currentEditor: ?TextEditor = action.payload && action.payload.editor ? action.payload.editor : null;
      const filePath = currentEditor ? currentEditor.getPath() : '';
      if (!filePath) {
        return Observable.of(updateEditorAction(null));
      }

      const currentState: TesterState = store.getState();
      return Observable.from(currentState.testers)
        .filter((tester: Tester) =>
          tester.scopes.some((scope: string) =>
            globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .isEmpty()
        .switchMap((isEmpty: boolean) => {
          if (isEmpty) {
            return Observable.of(updateEditorAction(null));
          }
          return Observable.of(updateEditorAction(currentEditor));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
