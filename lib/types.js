'use babel';

/* @flow */
/* flow-include
import type { Range, Point, TextEditor } from 'atom'
export type Tester = {
  // Automatically added
  __$sb_tester_version: number,
  __$sb_tester_activated: boolean,
  __$sb_tester_request_latest: number,
  __$sb_tester_request_last_received: number,

  // From providers
  name: string,
  lintsOnChange?: boolean,
  scopes: Array<string>,
  test(textEditor: TextEditor): ?{messages: Array<Message>, output: string} |
                                Promise<?{messages: Array<Message>, output: string}>,
}

export type Message = {
  duration: number,
  error: string,
  filePath: string,
  lineNumber: number,
  state: 'passed' | 'failed' | 'skipped',
  title: string,
}

export type Gutter = {
  decorateMarker: (Object, Object) => void;
}

export type State = {
  scope: 'file' | 'project',
  testerViewState: any,
}
*/
