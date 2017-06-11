'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SET_FILTER, errorAction, transformMessagesAction } from '../actions';
import type { TesterAction } from '../../types';

export default function setFilter(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(SET_FILTER)
    .map(() => transformMessagesAction())
    .catch(err => Observable.of(errorAction(err)));
}
