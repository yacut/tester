'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { INCREASE_COUNTER, error, increaseCounterAction } from '../actions';

export default function increaseCounter(action$: Observable) {
  return action$.ofType(INCREASE_COUNTER)
    .switchMap(() => increaseCounterAction())
    .catch(err => Observable.of(error(err)));
}
