'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_MESSAGES, error, updateMessagesAction } from '../actions';

export default function updateMessages(action$: Observable) {
  return action$.ofType(UPDATE_MESSAGES)
    .last()
    .map(action => updateMessagesAction(action.payload.messages))
    .catch(err => Observable.of(error(err)));
}
