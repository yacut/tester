'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { STOP_TEST, errorAction } from '../actions';

export default function stopTest(action$: Observable) {
  return action$.ofType(STOP_TEST)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
