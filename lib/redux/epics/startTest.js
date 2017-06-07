'use babel';

/* @flow*/
import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import {
  START_TEST,
  errorAction,
  transformMessagesAction,
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
      const isProjectTest = action.payload ? action.payload.isProjectTest : false;
      if (!isProjectTest && (!currentState.editor || !currentState.editor.getPath() || currentState.editor.isModified())) {
        return Observable.of(finishTestAction());
      }

      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      // TODO return empty stream if not in scope
      return Observable.from(currentState.testers)
        .filter(tester => isProjectTest || tester.scopes.some(scope => globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .flatMap(tester => tester.test(isProjectTest ? null : currentState.editor, currentState.additionalArgs))
        .toArray()
        .switchMap((results) => {
          // TODO make merge results more pretty
          let messages = currentState.rawMessages || [];
          let output = '';
          results.forEach((result) => {
            result.messages.forEach((message) => {
              messages = messages.filter(m => m.filePath !== message.filePath);
            });
            messages = messages.concat(result.messages);
            output += result.output;
          });
          // ***

          let stream = Observable.of(finishTestAction());
          if (output) {
            stream = Observable.concat(Observable.of(updateOutputAction(output)), stream);
          }
          if (messages && messages.length > 0) {
            stream = Observable.concat(Observable.of(transformMessagesAction(messages)), stream);
          }
          return stream;
        });
    })
    .catch(err => Observable.of(errorAction(err), stopTestAction()));
}
