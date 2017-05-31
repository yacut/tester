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
      const state = store.getState();
      let messages = [];
      state.messages.forEach((stateMessage) => {
        let shared = false;
        for (const j in payload.messages) {
          if (payload.messages[j].filePath === stateMessage.filePath) {
            shared = true;
            break;
          }
        }
        if (!shared) {
          messages.push(stateMessage);
        }
      });
      messages = messages.concat(payload.messages);
      updateMessagesAction(messages);
    })
    .catch(err => Observable.of(error(err)));
}
