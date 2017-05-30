'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { BEGIN_TEST, error, beginTestAction } from '../actions';

export default function beginTest(action$: Observable) {
  return action$.ofType(BEGIN_TEST)
    .last()
    .switchMap(() => beginTestAction())
    .catch(err => Observable.of(error(err)));
}
