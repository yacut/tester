'use babel';

/* @flow */
/* flow-include
import type { Range, Point, TextEditor } from 'atom'
export type Tester = {
  // From providers
  name: string,
  options?: Object,
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
