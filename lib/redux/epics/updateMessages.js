'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_MESSAGES, error, updateMessagesAction } from '../actions';

export default function updateStatus(action$: Observable) {
  return action$.ofType(UPDATE_MESSAGES)
    .map(action => action.payload)
    .switchMap(payload => updateMessagesAction(payload.messages))
    .catch(err => Observable.of(error(err)));
}
