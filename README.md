# Tester

[![Build Status](https://travis-ci.org/yacut/tester.svg)](https://travis-ci.org/yacut/tester)
[![Windows Build Status](https://ci.appveyor.com/api/projects/status/github/yacut/tester?svg=true)](https://ci.appveyor.com/api/projects/status/github/yacut/tester)
[![APM Version](https://img.shields.io/apm/v/tester.svg)](https://atom.io/packages/tester)
[![APM Downloads](https://img.shields.io/apm/dm/tester.svg)](https://atom.io/packages/tester)
[![GitHub stars](https://img.shields.io/github/stars/yacut/tester.svg)](https://github.com/yacut/tester/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/yacut/tester.svg)](https://github.com/yacut/tester/issues)
[![Dependencies!](https://img.shields.io/david/yacut/Tester.svg)](https://david-dm.org/yacut/tester)

Tester is a test runner for the hackable [Atom Editor](http://atom.io). Additionally, you need to install a specific tester provider for your test framework. You will find a full list below in the [Known provider](#known-providers) section.

![Preview](https://raw.githubusercontent.com/yacut/tester/master/resources/preview.gif)

### Base Features
- IDE based Feedback

  - Gutter test result markers

    ![gutter-markers](https://raw.githubusercontent.com/yacut/tester/master/resources/gutter-markers.png)

  - In-line error messages

    ![inline-error](https://raw.githubusercontent.com/yacut/tester/master/resources/inline-error.png)

  - Console test output

    ![console-output](https://raw.githubusercontent.com/yacut/tester/master/resources/console-output.png)

  - Test result view

    ![result-view](https://raw.githubusercontent.com/yacut/tester/master/resources/result-view.png)

- Session based test watching
  - Test file on open
  - Test file after save
  - Test project

- Supported test frameworks (for now):
  * [Mocha](https://mochajs.org/)
  * [Jest](https://github.com/facebook/jest)
  * [PHPUnit](https://phpunit.de/)

#### How to / Installation

You can install through the CLI by doing:

```
$ apm install tester
```

Or you can install from Settings view by searching for `Tester`.

### Known providers

* [Mocha](https://atom.io/packages/tester-mocha) test runner.
* [Jest](https://atom.io/packages/tester-jest) test runner.
* [PHPUnit](https://atom.io/packages/tester-phpunit) test runner.

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
    test(textEditor/* or null e.g. to run all tests*/, additionalArgs/*from results views*/) {
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
    stop(textEditor) {
      // stop tester if needed
    }
  };
}
```

### Inspiration

I'd like to give a shout out to [Wallaby.js](https://wallabyjs.com/), which is a significantly more comprehensive and covers a lot more editors, if this extension interests you - check out that too.

### Contribute

Stick to imposed codestyle:

* `$ npm i`
* `$ npm test`

### Roadmap

- [x] add unknown status for test which not ran
- [x] replace all views with react components
- [x] add table view with results similar to nuclide diagnostics
  - [ ] sort data by column head
  - [ ] resize column
  - [x] quick set additional args for test runner
  - [x] merge results from each test runner
- [x] add run all project tests command
- [ ] implement [Redux](https://github.com/reactjs/redux)
- [ ] implement [redux-observable](https://github.com/redux-observable/redux-observable)
- [ ] use [Bluebird](http://bluebirdjs.com/docs/getting-started.html)
