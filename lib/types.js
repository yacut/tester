'use babel'
/* @flow */

import type { Range, Point, TextEditor } from 'atom'

/* flow-include
export type Tester = {
  // Automatically added
  __$sb_tester_version: number,
  __$sb_tester_activated: boolean,
  __$sb_tester_request_latest: number,
  __$sb_tester_request_last_received: number,

  // From providers
  name: string,
  scope: 'file' | 'project',
  lintOnFly?: boolean, // <-- legacy
  lintsOnChange?: boolean,
  grammarScopes: Array<string>,
  test(textEditor: TextEditor): ?Array<Message> | Promise<?Array<Message>>,
}

export type Message = { }

export type State = {
  scope: 'file' | 'project',
  testerViewState: any,
}
*/
