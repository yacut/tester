'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST_PROJECT, errorAction, startTestAction } from '../actions';
import type { Store } from '../../types';

export default function testProject(action$: Observable, store: Store) {
  return action$.ofType(TEST_PROJECT)
    .filter(() => !store.getState().testRunning)
    .map(() => startTestAction(true))
    .catch(err => Observable.of(errorAction(err)));
}
