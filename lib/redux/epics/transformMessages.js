'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { TRANSFORM_MESSAGES, errorAction, updateMessagesAction } from '../actions';
import type { Message, Store, TesterAction, TesterState } from '../../types';


export default function transformMessages(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(TRANSFORM_MESSAGES)
    .switchMap((action) => {
      const currentState: TesterState = store.getState();
      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      const sortKey = currentState.sorter.key;
      const desc = currentState.sorter.desc;
      const rawMessages: Array<Message> = action.payload && action.payload.rawMessages ? action.payload.rawMessages : currentState.rawMessages;
      return Observable.from(rawMessages)
        .filter((message: Message) => {
          if (!currentState.currentFileOnly) {
            return true;
          }
          return message.filePath === filePath;
        })
        .toArray()
        .map((messages: Array<Message>) => {
          if (!sortKey) {
            return messages;
          }
          return messages.sort((current, next) => {
            const currentValue = (sortKey === 'error') ? (current.error ? current.error.message : '') : current[sortKey];
            const nextValue = (sortKey === 'error') ? (next.error ? next.error.message : '') : next[sortKey];

            if (currentValue.toString() < nextValue.toString()) {
              return desc ? 1 : -1;
            }
            if (currentValue.toString() > nextValue.toString()) {
              return desc ? -1 : 1;
            }
            return 0;
          });
        })
        .switchMap((transformedMessages: Array<Message>) => {
          if (currentState.messages.length === transformedMessages.length &&
            currentState.messages.every((v, i) => v === transformedMessages[i])) {
            return Observable.empty();
          }
          return Observable.of(updateMessagesAction(transformedMessages, rawMessages));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
