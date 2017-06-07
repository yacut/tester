'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TRANSFORM_MESSAGES, errorAction, updateMessagesAction } from '../actions';
import type { Store } from '../../types';


export default function transformMessages(action$: Observable, store: Store) {
  return action$.ofType(TRANSFORM_MESSAGES)
    .switchMap((action) => {
      console.log(action);
      const currentState = store.getState();
      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      const sortKey = currentState.sorter.key;
      const desc = currentState.sorter.desc;
      const rawMessages = action.payload && action.payload.rawMessages ? action.payload.rawMessages : currentState.rawMessages;
      return Observable.from(rawMessages)
        .filter((message) => {
          if (!currentState.currentFileOnly) {
            return true;
          }
          return message.filePath === filePath;
        })
        .toArray()
        .map(messages => messages.sort((current, next) => {
          const currentValue = (sortKey === 'error') ? (current.error ? current.error.message : '') : current[sortKey];
          const nextValue = (sortKey === 'error') ? (next.error ? next.error.message : '') : next[sortKey];

          if (currentValue < nextValue) {
            return desc ? 1 : -1;
          }
          if (currentValue > nextValue) {
            return desc ? -1 : 1;
          }
          return 0;
        }))
        .switchMap((transformedMessages) => {
          console.log('transformMessages', transformMessages);
          if (currentState.messages === transformedMessages) {
            return Observable.empty();
          }
          return Observable.of(updateMessagesAction(transformedMessages, rawMessages));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
