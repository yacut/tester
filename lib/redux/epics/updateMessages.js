'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_MESSAGES, errorAction } from '../actions';
import { clearDecoratedGutter, clearInlineMessages, decorateGutter, setInlineMessages } from '../../decorate-manager';
import type { TesterState, TesterAction, Store } from '../../types';

function updateDecorations(currentState: TesterState) {
  if (currentState.editor) {
    const gutter = currentState.editor.gutterWithName('tester');
    if (!gutter) {
      return;
    }

    clearDecoratedGutter(currentState.editor, gutter);
    decorateGutter(currentState.editor, gutter, currentState.messages);
    clearInlineMessages(currentState.editor);
    if (atom.config.get('showInlineError')) {
      setInlineMessages(currentState.editor, currentState.messages, atom.config.get('ansiToHtml'), atom.config.get('inlineErrorPosition'));
    }
  }
}

export default function updateMessages(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(UPDATE_MESSAGES)
    .switchMap(() => Observable.of(updateDecorations(store.getState())))
    .catch(err => Observable.of(errorAction(err)));
}
