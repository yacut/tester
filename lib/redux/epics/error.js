'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ERROR } from '../actions';
import type { TesterAction } from '../../types';

export default function error(action$: Observable<TesterAction>): Observable<TesterAction> {
  return action$.ofType(ERROR)
    .map((action: TesterAction) => action.error)
    .switchMap((err: Error) => {
      console.error('Tester:', err);
      atom.notifications.addError(`Tester: ${err.message}`);
      return Observable.empty();
    });
}
