'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, errorAction, startTestAction } from '../actions';
import type { Store } from '../../types';

// TODO move scope filter here
export default function test(action$: Observable, store: Store) {
  return action$.ofType(TEST)
    .filter(() => !store.getState().testRunning)
    .map(() => startTestAction(false))
    .catch(err => Observable.of(errorAction(err)));
}
