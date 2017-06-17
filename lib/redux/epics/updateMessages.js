'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_MESSAGES, errorAction } from '../actions';
import { clearDecoratedGutter, clearInlineMessages, decorateGutter, setInlineMessages } from '../../decorate-manager';
import type { TesterAction, Store } from '../../types';

export default function updateMessages(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(UPDATE_MESSAGES)
    .switchMap(async () => {
      const currentState = store.getState();
      if (currentState.editor) {
        await clearDecoratedGutter(currentState.editor);
        await decorateGutter(currentState.editor, currentState.messages);

        await clearInlineMessages(currentState.editor);
        await setInlineMessages(currentState.editor, currentState.messages);
      }
      return Observable.empty();
    })
    .catch(err => Observable.of(errorAction(err)));
}
