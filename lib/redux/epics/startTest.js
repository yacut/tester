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
  setFilterAction,
} from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store, Tester, TesterAction, TesterResults, TesterState } from '../../types';

export default function startTest(action$: Observable<TesterAction>, store: Store): Observable<TesterAction> {
  return action$.ofType(START_TEST)
    .switchMap((action: TesterAction) => {
      const currentState: TesterState = store.getState();
      const isProjectTest: ?boolean = action.payload ? action.payload.isProjectTest : false;
      if (!isProjectTest && (!currentState.editor || !currentState.editor.getPath() || currentState.editor.isModified())) {
        return Observable.of(finishTestAction());
      }

      const filePath = currentState.editor ? currentState.editor.getPath() : '';
      return Observable.from(currentState.testers)
        .filter((tester: Tester) => isProjectTest || tester.scopes.some(scope =>
            globToRegex(scope).test(convertWindowsPathToUnixPath(filePath))))
        .flatMap((tester: Tester) => tester.test(isProjectTest ? null : currentState.editor, currentState.additionalArgs))
        .reduce((results: TesterResults, result: ?TesterResults) => {
          if (result && result.messages && result.messages.constructor === Array) {
            result.messages.forEach((message) => {
              results.messages = results.messages.filter(m => m.filePath !== message.filePath);
            });
            results.messages = results.messages.concat(result.messages);
            results.output += result.output;
          }
          return results;
        },
        {
          messages: currentState.rawMessages.filter(m => m.filePath) || [],
          output: '',
        })
        .switchMap((results: TesterResults) => {
          let stream = Observable.of(finishTestAction());
          if (results.output) {
            stream = Observable.concat(Observable.of(updateOutputAction(results.output)), stream);
          }
          if (results.messages && results.messages.length > 0) {
            stream = Observable.concat(Observable.of(transformMessagesAction(results.messages)), stream);
          }
          if (isProjectTest && atom.config.get('tester.removeCurrentFileFilterIfProjectTest')) {
            stream = Observable.concat(Observable.of(setFilterAction(false)), stream);
          }
          return stream;
        });
    })
    .catch(err => Observable.of(errorAction(err), stopTestAction()));
}
