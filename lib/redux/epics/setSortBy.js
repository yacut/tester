'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SET_SORTBY, errorAction, transformMessagesAction } from '../actions';

export default function setSortBy(action$: Observable) {
  return action$.ofType(SET_SORTBY)
    .map(() => transformMessagesAction())
    .catch(err => Observable.of(errorAction(err)));
}
