'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST_LAST, errorAction, startTestAction } from '../actions';
import type { Store, TesterAction } from '../../types';

export default function testLast(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(TEST_LAST)
    .filter(() => !store.getState().testRunning)
    .map(() => startTestAction(store.getState().isProjectTest))
    .catch(err => Observable.of(errorAction(err)));
}
