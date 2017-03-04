'use babel';

/* @flow */

import { Disposable } from 'atom';
/* flow-include
import type { Message } from './types'
*/

export const $version = '__$sb_tester_version';

export function subscriptiveObserve(
  object/* : Object*/,
  eventName/* : string*/,
  callback/* : Function*/)/* : Disposable*/ {
  let subscription = null;
  const eventSubscription = object.observe(eventName, function observeProps(props) {
    if (subscription) {
      subscription.dispose();
    }
    subscription = callback.call(this, props);
  });

  return new Disposable(() => {
    eventSubscription.dispose();
    if (subscription) {
      subscription.dispose();
    }
  });
}
