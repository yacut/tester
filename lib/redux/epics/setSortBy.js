'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SET_SORTBY, errorAction, transformMessagesAction } from '../actions';
import type { TesterAction } from '../../types';

export default function setSortBy(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(SET_SORTBY)
    .map(() => transformMessagesAction())
    .catch(err => Observable.of(errorAction(err)));
}
