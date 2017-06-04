'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, errorAction, startTestAction } from '../actions';
import type { Store } from '../../types';

export default function test(action$: Observable, store: Store) {
  return action$.ofType(TEST)
    .map((action) => {
      console.log(action);
      const currentState = store.getState();
      if (currentState.testRunning) {
        return Observable.empty();
      }
      return Observable.of(startTestAction());
    })
    .catch(err => Observable.of(errorAction(err)));
}
