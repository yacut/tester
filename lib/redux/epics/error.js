'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ERROR } from '../actions';

export default function error(action$: Observable) {
  return action$.ofType(ERROR)
    .switchMap((action) => {
      console.error(action.errorMessage);
      atom.notifications.addError(action.errorMessage);
    })
    .catch(err => Observable.of(console.error(err)));
}
