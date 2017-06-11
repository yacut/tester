'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import { TEST, errorAction, startTestAction } from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store, Tester, TesterAction, TesterState } from '../../types';

// TODO move scope filter here
export default function test(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(TEST)
    .filter(() => !store.getState().testRunning)
    .switchMap(() => {
      const currentState: TesterState = store.getState();
      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      return Observable.from(currentState.testers)
        .filter((tester: Tester) =>
          tester.scopes.some(scope => globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .isEmpty()
        .switchMap((isEmpty: boolean) => {
          if (isEmpty) {
            return Observable.empty();
          }
          return Observable.of(startTestAction(false));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
