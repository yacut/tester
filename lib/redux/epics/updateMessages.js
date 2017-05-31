'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_MESSAGES, error, updateMessagesAction } from '../actions';
import type { Store } from '../../types';

export default function updateMessages(action$: Observable, store: Store) {
  return action$.ofType(UPDATE_MESSAGES)
    .last()
    .map(action => action.payload)
    .switchMap((payload) => {
      // TODO merge messages
      console.log('current state', store.getState());
      updateMessagesAction(payload.messages);
    })
    .catch(err => Observable.of(error(err)));
}