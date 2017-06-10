'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST_LAST, errorAction, startTestAction } from '../actions';
import type { Store } from '../../types';

export default function testLast(action$: Observable, store: Store) {
  return action$.ofType(TEST_LAST)
    .map(() => startTestAction(store.getState().isProjectTest))
    .catch(err => Observable.of(errorAction(err)));
}
