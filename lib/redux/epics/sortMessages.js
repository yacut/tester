'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SORT_MESSAGES, errorAction, transformMessagesAction } from '../actions';

export default function sortMessages(action$: Observable) {
  return action$.ofType(SORT_MESSAGES)
    .map(() => transformMessagesAction())
    .catch(err => Observable.of(errorAction(err)));
}
