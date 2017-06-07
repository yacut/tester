'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { FILTER_MESSAGES, errorAction, updateMessagesAction } from '../actions';
import type { Store } from '../../types';

export default function filterMessages(action$: Observable, store: Store) {
  return action$.ofType(FILTER_MESSAGES)
    .switchMap((action) => {
      console.log(action);
      const currentState = store.getState();
      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      return Observable.forkJoin(
        Observable.fromArray(currentState.messages)
          .filter(message => currentState.currentFileOnly && message.filePath === filePath)
          .defaultIfEmpty(currentState.messages),
        )
        .switchMap((filteredMessages) => {
          if (currentState.messages === filteredMessages) {
            return Observable.empty();
          }
          return Observable.of(updateMessagesAction(filteredMessages));
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
