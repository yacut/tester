'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { FINISH_TEST, error, finishTestAction } from '../actions';

export default function finishTest(action$: Observable) {
  return action$.ofType(FINISH_TEST)
    .last()
    .switchMap(() => finishTestAction())
    .catch(err => Observable.of(error(err)));
}
