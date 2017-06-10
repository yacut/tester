'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_OUTPUT, errorAction } from '../actions';

export default function updateOutput(action$: Observable) {
  return action$.ofType(UPDATE_OUTPUT)
    .switchMap(() => Observable.empty())
    .catch(err => Observable.of(errorAction(err)));
}
