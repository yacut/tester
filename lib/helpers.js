'use babel';
/*@flow */

import { Disposable, Range, Point } from 'atom'
import minimatch from 'minimatch'
import type { Message } from './types'

export const $version = '__$sb_linter_version'
export const $activated = '__$sb_linter_activated'
export const $requestLatest = '__$sb_linter_request_latest'
export const $requestLastReceived = '__$sb_linter_request_last_received'

export function subscriptiveObserve(object/*: Object*/, eventName/*: string*/, callback/*: Function*/)/*: Disposable*/ {
  let subscription = null
  const eventSubscription = object.observe(eventName, function(props) {
    if (subscription) {
      subscription.dispose()
    }
    subscription = callback.call(this, props)
  })

  return new Disposable(function() {
    eventSubscription.dispose()
    if (subscription) {
      subscription.dispose()
    }
  })
}
