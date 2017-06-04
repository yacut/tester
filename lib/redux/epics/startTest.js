'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import { START_TEST, errorAction, updateMessagesAction, updateOutputAction, finishTestAction } from '../actions';
import { convertWindowsPathToUnixPath } from '../../helpers';
import type { Store } from '../../types';

export default function startTest(action$: Observable, store: Store) {
  return action$.ofType(START_TEST)
    .subscribe(value => console.log(START_TEST, value))
    .map((action) => {
      console.log(action);
      const currentState = store.getState();

      if (!currentState.editor || !currentState.editor.getPath() || currentState.editor.isModified()) {
        return Observable.empty();
      }

      const filePath = currentState.editor ? currentState.editor.getPath() : '';

      const promises:Array<Promise<any>> = [];
      currentState.testers.forEach((tester) => {
        let shouldTriggerTester = false;
        try {
          shouldTriggerTester = tester.scopes.some(scope =>
              globToRegex(scope).test(convertWindowsPathToUnixPath(filePath)));
        } catch (error) {
          console.error('Tester: ', error);
        }
        if (!shouldTriggerTester) {
          return Promise.resolve(true);
        }
        promises.push(new Promise(resolve => resolve(tester.test(currentState.editor, currentState.additionalArgs))));
      });

      return Observable.of(Promise.all(promises)
        .then((results) => {
          let messages = [];
          let output = '';
          results.forEach((result) => {
            messages = messages.concat(result.messages);
            output += result.output;
          });
          if (promises.length > 0) {
            updateOutputAction(output);
            updateMessagesAction(messages);
          }
        })
        .then(() => {
          if (promises.length > 0) {
            finishTestAction();
          }
        })
        .catch((error) => {
          console.error('Tester: ', error);
          finishTestAction();
        }));
    })
    .catch(err => Observable.of(errorAction(err)));
}
