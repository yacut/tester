'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_STATUS, error, updateStatusAction } from '../actions';

export default function updateStatus(action$: Observable) {
  return action$.ofType(UPDATE_STATUS)
    .map(action => action.payload)
    .switchMap(payload => updateStatusAction(payload.messages, payload.output))
    .catch(err => Observable.of(error(err)));
}
