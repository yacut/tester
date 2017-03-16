'use babel';

/* @flow */

import { Disposable } from 'atom';
import AnsiToHtml from 'ansi-to-html';
/* flow-include
import type { Message } from './types'
*/

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

let ansiToHtml;
export const $activated = '__$sb_tester_activated';
export const $requestLatest = '__$sb_tester_request_latest';
export const $requestLastReceived = '__$sb_tester_request_last_received';

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

export function convertWindowsPathToUnixPath(path /* :string*/) /* :string*/ {
  if (process.platform.match(/^win/)) {
    path = path.replace(/[\\]+/g, '/');
  }
  return path;
}

export function setConsoleColors() {
    // dark background colors
  let ansiToHtmlOptions = {
    fg: '#FFF',
    bg: '#000',
  };
    // light background colors
  if (atom.themes.getActiveThemeNames().some(themeName => themeName.includes('light'))) {
    ansiToHtmlOptions = {
      fg: '#000',
      bg: '#FFF',
    };
  }
  ansiToHtml = new AnsiToHtml(ansiToHtmlOptions);
}

export function convertAnsiStringToHtml(string /* :string*/) {
  return ansiToHtml.toHtml(string);
}

export function escapeHtml(string /* :string*/) {
  return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
}
