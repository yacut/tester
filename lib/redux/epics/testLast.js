'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST_LAST, errorAction } from '../actions';

export default function testLast(action$: Observable) {
  return action$.ofType(TEST_LAST)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
