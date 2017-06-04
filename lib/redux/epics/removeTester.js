'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { REMOVE_TESTER, errorAction } from '../actions';

export default function removeTester(action$: Observable) {
  return action$.ofType(REMOVE_TESTER)
    .subscribe(action => console.log(REMOVE_TESTER, action))
    .catch(err => Observable.of(errorAction(err)));
}
