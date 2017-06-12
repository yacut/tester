'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { GO_TO_PREVIOUS_TEST, errorAction, setCurrentMessageAction } from '../actions';
import type { TesterAction, Store } from '../../types';

export default function goToPreviousTest(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(GO_TO_PREVIOUS_TEST)
    .switchMap(() => {
      const currentState = store.getState();

      if (!currentState.messages || currentState.messages.length === 0) {
        return Observable.empty();
      }

      if (!currentState.currentMessage) {
        return Observable.of(setCurrentMessageAction(currentState.messages[currentState.messages.length - 1]));
      }

      const currentMessage = currentState.currentMessage;
      const index = currentState.messages.findIndex(message =>
        message.filePath === currentMessage.filePath &&
        message.lineNumber === currentMessage.lineNumber);

      if (index > 0 && index <= currentState.messages.length - 1) {
        return Observable.of(setCurrentMessageAction(currentState.messages[index - 1]));
      }

      return Observable.of(setCurrentMessageAction(currentState.messages[currentState.messages.length - 1]));
    })
    .catch(err => Observable.of(errorAction(err)));
}
