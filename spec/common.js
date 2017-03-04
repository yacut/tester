/* @flow */

import Path from 'path';

export function getTester()/* : Object*/ {
  return {
    name: 'tester-name',
    options: {},
    scopes: ['**/test/*.js', '**/*spec.js'],
    test() {
      // Note, a Promise may be returned as well!
      return {
        messages: [
          {
            duration: 1, // duration in ms
            error: {
              name: 'optional error object',
              message: 'something went wrong',
              actual: 'optional actual result', // can be an object
              expected: 'optional expected result', // can be an object
              operator: 'optional operator',
            },
            filePath: 'file path to highlight',
            lineNumber: 1, // line number to highlight
            state: 'failed', // 'passed' | 'failed' | 'skipped',
            title: 'some test title',
          },
        ],
        output: 'tester console output',
      };
    },
  };
}

export function getMessage(param/* : ?(boolean | string)*/)/* : Object*/ {
  const message/* : Object*/ = { severity: 'error', excerpt: String(Math.random()), location: { file: __filename, position: [[0, 0], [0, 0]] } };
  message.location.file = param;
  return message;
}

export function getFixturesPath(path/* : string*/)/* : string*/ {
  return Path.join(__dirname, 'fixtures', path);
}
