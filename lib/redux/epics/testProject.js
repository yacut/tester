'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST_PROJECT, errorAction } from '../actions';

export default function test(action$: Observable) {
  return action$.ofType(TEST_PROJECT)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
