'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SORT_MESSAGES, errorAction } from '../actions';

export default function sortMessages(action$: Observable) {
  return action$.ofType(SORT_MESSAGES)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
