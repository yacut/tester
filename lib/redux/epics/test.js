'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TEST, errorAction } from '../actions';

export default function test(action$: Observable) {
  return action$.ofType(TEST)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
