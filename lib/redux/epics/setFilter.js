'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SET_FILTER, errorAction, transformMessagesAction } from '../actions';

export default function setFilter(action$: Observable) {
  return action$.ofType(SET_FILTER)
    .map(() => transformMessagesAction())
    .catch(err => Observable.of(errorAction(err)));
}
