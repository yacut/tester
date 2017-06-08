'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import { TEST, errorAction, startTestAction } from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store } from '../../types';

// TODO move scope filter here
export default function test(action$: Observable, store: Store) {
  return action$.ofType(TEST)
    .filter(() => !store.getState().testRunning)
    .switchMap(() => {
      const currentState = store.getState();
      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      return Observable.of(currentState.testers)
        .filter(tester => tester.scopes.some(scope => globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .isEmpty()
        .switchMap((isEmpty) => {
          if (isEmpty) {
            return Observable.empty();
          }
          return Observable.of(startTestAction(false));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
