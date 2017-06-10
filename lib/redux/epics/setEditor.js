'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import { SET_EDITOR, errorAction, updateEditorAction } from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store } from '../../types';

export default function setEditor(action$: Observable, store: Store) {
  return action$.ofType(SET_EDITOR)
    .switchMap((action) => {
      const currentEditor = action.payload.editor;
      const filePath = currentEditor ? currentEditor.getPath() : '';
      if (!filePath) {
        return Observable.empty();
      }

      const currentState = store.getState();
      return Observable.from(currentState.testers)
        .filter(tester => tester.scopes.some(scope => globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .isEmpty()
        .switchMap((isEmpty) => {
          if (isEmpty) {
            return Observable.empty();
          }
          return Observable.of(updateEditorAction(currentEditor));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
