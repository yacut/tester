/* @flow */

import Path from 'path';

export function getTester(): Object {
  return {
    name: 'Some Linter',
    scope: 'project',
    lintsOnChange: false,
    grammarScopes: ['source.js'],
    test() {
      return [];
    },
  };
}

export function getMessage(param: ?(boolean | string)): Object {
  const message: Object = { severity: 'error', excerpt: String(Math.random()), location: { file: __filename, position: [[0, 0], [0, 0]] } };
  message.location.file = param;
  return message;
}

export function getFixturesPath(path/* : string*/)/* : string*/ {
  return Path.join(__dirname, 'fixtures', path);
}
