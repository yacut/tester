'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { SORT_MESSAGES, errorAction, updateMessagesAction } from '../actions';
import { sort } from '../../helpers';
import type { Store } from '../../types';

export default function sortMessages(action$: Observable, store: Store) {
  return action$.ofType(SORT_MESSAGES)
    .switchMap((action) => {
      console.log(action);
      const currentState = store.getState();
      const sortedMessages = sort(currentState.rawMessages.slice(0), currentState.sorter.key, currentState.sorter.desc);
      if (currentState.messages === sortedMessages) {
        return Observable.empty();
      }
      return Observable.of(updateMessagesAction(sortedMessages, currentState.rawMessages));
    })
    .catch(err => Observable.of(errorAction(err)));
}
