# Tester

<!-- [![Build Status](https://img.shields.io/circleci/project/yacut/tester.svg?style=flat-square)](https://circleci.com/gh/yacut/tester) -->
[![Plugin installs!](https://img.shields.io/apm/dm/tester.svg?style=flat-square)](https://atom.io/packages/tester)
[![Package version!](https://img.shields.io/apm/v/tester.svg?style=flat-square)](https://atom.io/packages/tester)
[![Dependencies!](https://img.shields.io/david/yacut/Tester.svg?style=flat-square)](https://david-dm.org/yacut/tester)

Tester is a test runner for the hackable [Atom Editor](http://atom.io). Additionally, you need to install a specific tester provider for your test framework. You will find a full list below in the [Known provider](#known-providers) section.


![Preview](https://raw.githubusercontent.com/yacut/tester/master/preview.gif)

#### How to / Installation

You can install through the CLI by doing:

```
$ apm install tester
```

Or you can install from Settings view by searching for `Tester`.

### Known provider

* [Mocha](https://atom.io/packages/tester-mocha) test runner.

### Tester API

#### Example

Declare the provider callback in the `package.json`.

```js
"providedServices": {
  "tester": {
    "versions": {
      "1.0.0": "provideTester"
    }
  }
}
```

Define the provider callback in `lib/main.js`.

```js
export function provideTester() {
  return {
    name: 'tester-name',
    options: {},
    scopes: ['**/test/*.js', '**/*spec.js'],
    test(textEditor) {
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
          }
        ],
        output: 'tester console output'
      };
    },
  };
}
```

#### Contribute

Stick to imposed codestyle:

* `$ npm i`
* `$ npm test`
