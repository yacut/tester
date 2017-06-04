
'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ADD_TESTER, errorAction/* , testAction*/ } from '../actions';

export default function addTester(action$: Observable) {
  return action$.ofType(ADD_TESTER)
    .switchMap(() => console.log('testAction()'))
    .catch(err => Observable.of(errorAction(err)));
}
