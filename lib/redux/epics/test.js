'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, errorAction, startTestAction } from '../actions';
import type { Store } from '../../types';

export default function test(action$: Observable, store: Store) {
  return action$.ofType(TEST)
    .subscribe(value => console.log(TEST, value))
    .filter(() => !store.getState().testRunning)
    .map(startTestAction)
    .catch(err => Observable.of(errorAction(err)));
}
