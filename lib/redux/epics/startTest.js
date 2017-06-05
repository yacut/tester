'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import globToRegex from 'glob-to-regexp';
import { START_TEST, errorAction, updateMessagesAction, updateOutputAction, finishTestAction } from '../actions';
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
          return;
        }
        promises.push(new Promise(resolve => resolve(tester.test(currentState.editor, currentState.additionalArgs))));
      });

      console.log('promises', promises);
      return Observable.forkJoin(promises)
        .flatMap((results) => {
          let messages = [];
          let output = '';
          results.forEach((result) => {
            messages = messages.concat(result.messages);
            output += result.output;
          });
          if (promises.length > 0) {
            return Observable.concat(
              Observable.of(updateOutputAction(output)),
              Observable.of(updateMessagesAction(messages)),
              Observable.of(finishTestAction()),
            );
          }
          return Observable.of(finishTestAction());
        });
    })
    .catch(err => Observable.of(errorAction(err)));
}
