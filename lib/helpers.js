'use babel';

// @flow

import { Disposable } from 'atom';
import AnsiToHtml from 'ansi-to-html';
import { Observable } from 'rxjs';
import type { Message, SubscribeFunction } from './types';

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
  object : Object,
  eventName : string,
  callback : Function) : Disposable {
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

export function convertWindowsPathToUnixPath(path :string) :string {
  if (process.platform.match(/^win/)) {
    path = path.replace(/[\\]+/g, '/');
  }
  return path;
}

export function convertAnsiStringToHtml(string :string) {
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
  return ansiToHtml.toHtml(string);
}

export function escapeHtml(string :string) {
  return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
}

export function normalizeString(message: Message, shouldAnsiToHtml: boolean) {
  if (!message || !message.error) {
    return '';
  }
  let content = message.error.message || '';
  content = escapeHtml(content);
  if (shouldAnsiToHtml) {
    content = convertAnsiStringToHtml(content);
  }
  if (message.error.name && message.error.name !== '') {
    content = `${message.error.name}: ${content}`;
  }
  return content;
}

export function observableFromSubscribeFunction<T>(
  fn: SubscribeFunction<T>,
): Observable<T> {
  return Observable.create((observer) => {
    const disposable = fn(observer.next.bind(observer));
    return () => {
      disposable.dispose();
    };
  });
}

export function sort(messages: Array<Message>, key: string, desc: ?boolean): Array<Message> {
  if (!messages || messages.constructor !== Array || messages.length === 0) {
    return [];
  }
  if (key === '') {
    return messages;
  }
  return messages.sort((current, next) => {
    const currentValue = (key === 'error') ? (current.error ? current.error.message : '') : current[key];
    const nextValue = (key === 'error') ? (next.error ? next.error.message : '') : next[key];

    if (currentValue < nextValue) {
      return desc ? 1 : -1;
    }
    if (currentValue > nextValue) {
      return desc ? -1 : 1;
    }
    return 0;
  });
}
