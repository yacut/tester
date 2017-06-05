'use babel';

/* @flow*/
import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import {
  START_TEST,
  errorAction,
  updateMessagesAction,
  updateOutputAction,
  finishTestAction,
  stopTestAction,
} from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store } from '../../types';

export default function startTest(action$: Observable, store: Store) {
  return action$.ofType(START_TEST)
    .switchMap((action) => {
      console.log('EPIC', action);
      const currentState = store.getState();
      if (!currentState.editor || !currentState.editor.getPath() || currentState.editor.isModified()) {
        return Observable.of(finishTestAction());
      }

      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      return Observable.forkJoin(
          Observable.from(currentState.testers)
            .filter(tester => tester.scopes.some(scope => globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
            .flatMap(tester => tester.test(currentState.editor, currentState.additionalArgs))
            .defaultIfEmpty({ messages: [], output: '' }),
        )
        .switchMap((results) => {
          console.log('results', results);
          let messages = [];
          let output = '';
          results.forEach((result) => {
            messages = messages.concat(result.messages);
            output += result.output;
          });
          return Observable.of(
            updateOutputAction(output),
            updateMessagesAction(messages),
            finishTestAction(),
          );
        });
    })
    .catch(err => Observable.of(errorAction(err), stopTestAction()));
}
