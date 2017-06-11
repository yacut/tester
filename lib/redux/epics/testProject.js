'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST_PROJECT, errorAction, startTestAction } from '../actions';
import type { Store, TesterAction } from '../../types';

export default function testProject(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(TEST_PROJECT)
    .filter(() => !store.getState().testRunning)
    .map(() => startTestAction(true))
    .catch(err => Observable.of(errorAction(err)));
}
