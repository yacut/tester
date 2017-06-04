'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ADD_TESTER, errorAction } from '../actions';

export default function addTester(action$: Observable) {
  return action$.ofType(ADD_TESTER)
    .subscribe(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
