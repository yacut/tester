'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ERROR, error, finishTestAction } from '../actions';

export default function beginTest(action$: Observable) {
  return action$.ofType(ERROR)
    .last()
    .map(action => action.payload)
    .switchMap((payload) => {
      error(payload.message);
      finishTestAction();
    });
}
