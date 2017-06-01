'use babel';

/* @flow*/

import { Observable } from 'rxjs';
import { ERROR } from '../actions';

export default function error(action$: Observable) {
  return action$.ofType(ERROR)
    .map(action => console.log(action))
    .catch(err => Observable.of(console.error(err)));
}
