'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, errorAction, startTestAction, STOP_TEST } from '../actions';
import type { Store } from '../../types';

export default function test(action$: Observable, store: Store) {
  return action$.ofType(TEST)
    .filter(() => !store.getState().testRunning)
    .map(startTestAction)
    .takeUntil(action$.ofType(STOP_TEST))
    .catch(err => Observable.of(errorAction(err)));
}
