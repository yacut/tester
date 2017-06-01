'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_MESSAGES, errorAction } from '../actions';

export default function updateMessages(action$: Observable) {
  return action$.ofType(UPDATE_MESSAGES)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
