'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { START_TEST, TEST_LAST, errorAction } from '../actions';

export default function testLast(action$: Observable) {
  return action$.ofType(TEST_LAST)
    .switchMap(() => {
      console.log('find last test');
      return action$.ofType(START_TEST)
      .last()
      .toArray()
      .switchMap((action) => {
        console.log(action);
        return Observable.empty();
      });
    })
    .catch(err => Observable.of(errorAction(err)));
}
