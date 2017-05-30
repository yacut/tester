'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { UPDATE_EDITOR, error, updateEditorAction } from '../actions';

export default function updateOutput(action$: Observable) {
  return action$.ofType(UPDATE_EDITOR)
    .last()
    .map(action => action.payload)
    .switchMap(payload => updateEditorAction(payload.editor))
    .catch(err => Observable.of(error(err)));
}
