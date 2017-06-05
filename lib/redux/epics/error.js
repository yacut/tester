'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ERROR } from '../actions';

export default function error(action$: Observable) {
  return action$.ofType(ERROR)
    .map(action => action.errorMessage)
    .do(err => console.error(err))
    .ignoreElements();
}
