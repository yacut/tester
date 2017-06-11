'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { CLEAR, errorAction, updateMessagesAction, updateOutputAction } from '../actions';
import type { TesterAction } from '../../types';

export default function clear(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(CLEAR)
    .switchMap(() => Observable.of(updateMessagesAction([], []), updateOutputAction('')))
    .catch(err => Observable.of(errorAction(err)));
}
