'use babel';

/* @flow*/

import { combineEpics } from 'redux-observable';
import updateEpic from './update';

export default () => combineEpics(
  updateEpic,
);
