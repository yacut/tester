'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { STOP_TEST, errorAction } from '../actions';
import type { Store } from '../../types';

export default function stopTest(action$: Observable, store: Store) {
  return action$.ofType(STOP_TEST)
    .switchMap(() =>
      Observable.from(store.getState().testers)
        .do(tester => tester.stop())
        .ignoreElements(),
      )
    .catch(err => Observable.of(errorAction(err)));
}
