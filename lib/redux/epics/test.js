'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, errorAction, START_TEST } from '../actions';
import type { Store } from '../../types';

export default function test(action$: Observable, store: Store) {
  return action$.ofType(TEST)
    .filter(() => !store.getState().testRunning)
    .flatMap(() => Observable.of({ type: START_TEST }))
    .catch(err => Observable.of(errorAction(err)));
}
