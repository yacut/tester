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
      const currentState = store.getState();
      const isProjectTest = action.payload ? action.payload.isProjectTest : false;
      if (!isProjectTest && (!currentState.editor || !currentState.editor.getPath() || currentState.editor.isModified())) {
        return Observable.of(finishTestAction());
      }

      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      return Observable.from(currentState.testers)
        .filter(tester => isProjectTest || tester.scopes.some(scope => globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .flatMap(tester => tester.test(isProjectTest ? null : currentState.editor, currentState.additionalArgs))
        .reduce((results, result) => {
          if (result && result.messages && result.messages.constructor === Array) {
            result.messages.forEach((message) => {
              results.messages = results.messages.filter(m => m.filePath !== message.filePath);
            });
            results.messages = results.messages.concat(result.messages);
            results.output += result.output;
          }
          return results;
        }, { messages: currentState.rawMessages.filter(m => m.filePath) || [], output: '' })
        .switchMap((results) => {
          let stream = Observable.of(finishTestAction());
          if (results.output) {
            stream = Observable.concat(Observable.of(updateOutputAction(results.output)), stream);
          }
          if (results.messages && results.messages.length > 0) {
            stream = Observable.concat(Observable.of(transformMessagesAction(results.messages)), stream);
          }
          return stream;
        });
    })
    .catch(err => Observable.of(errorAction(err), stopTestAction()));
}
