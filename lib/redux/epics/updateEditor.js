'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_EDITOR, errorAction } from '../actions';

export default function updateEditor(action$: Observable) {
  return action$.ofType(UPDATE_EDITOR)
    .map(action => console.log(action))
    .catch(err => Observable.of(errorAction(err)));
}
