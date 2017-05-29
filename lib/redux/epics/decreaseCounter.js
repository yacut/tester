'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { DECREASE_COUNTER, error, decreaseCounterAction } from '../actions';

export default function increaseCounter(action$: Observable) {
  return action$.ofType(DECREASE_COUNTER)
    .switchMap(() => decreaseCounterAction())
    .catch(err => Observable.of(error(err)));
}
