'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { FILTER_MESSAGES, errorAction } from '../actions';

export default function filterMessages(action$: Observable) {
  return action$.ofType(FILTER_MESSAGES)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
