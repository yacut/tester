'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_OUTPUT, errorAction } from '../actions';
import type { TesterAction } from '../../types';

export default function updateOutput(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(UPDATE_OUTPUT)
    .switchMap(() => Observable.empty())
    .catch(err => Observable.of(errorAction(err)));
}
