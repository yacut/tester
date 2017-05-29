'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_OUTPUT, error, updateOutputAction } from '../actions';

export default function updateOutput(action$: Observable) {
  return action$.ofType(UPDATE_OUTPUT)
    .map(action => action.payload)
    .switchMap(payload => updateOutputAction(payload.output))
    .catch(err => Observable.of(error(err)));
}
