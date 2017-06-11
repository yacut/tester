'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { STOP_TEST, errorAction } from '../actions';
import type { Store, Tester, TesterAction } from '../../types';

export default function stopTest(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(STOP_TEST)
    .switchMap(() =>
      Observable.from(store.getState().testers)
        .do((tester: Tester) => tester.stop())
        .ignoreElements(),
      )
    .catch(err => Observable.of(errorAction(err)));
}
