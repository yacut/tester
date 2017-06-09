'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, TEST_LAST, TEST_PROJECT, errorAction } from '../actions';

export default function testLast(action$: Observable) {
  return action$.ofType(TEST_LAST)
    .map(() => action$.ofType(TEST || TEST_PROJECT)
      .last()
      .switchMap((action) => {
        console.log(action);
        return Observable.empty();
      }))
    .catch(err => Observable.of(errorAction(err)));
}
