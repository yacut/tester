'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { FILTER_MESSAGES, errorAction, transformMessagesAction } from '../actions';

export default function filterMessages(action$: Observable) {
  return action$.ofType(FILTER_MESSAGES)
    .map(() => transformMessagesAction())
    .catch(err => Observable.of(errorAction(err)));
}
