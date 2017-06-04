'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ADD_TESTER, errorAction } from '../actions';

export default function addTester(action$: Observable) {
  return action$.ofType(ADD_TESTER)
    .catch(err => Observable.of(errorAction(err)));
}
