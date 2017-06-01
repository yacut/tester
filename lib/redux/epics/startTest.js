'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { START_TEST, errorAction } from '../actions';

export default function startTest(action$: Observable) {
  return action$.ofType(START_TEST)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
