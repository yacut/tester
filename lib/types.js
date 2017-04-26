'use babel';

// @flow
import type { TextEditor } from 'atom';

export type MessageError = {
  name: string,
  message: string,
  actual?: any,
  expected?: any,
  operator?: string,
}

export type Message = {
  duration: number,
  error: MessageError,
  filePath: string,
  lineNumber: number,
  state: 'passed' | 'failed' | 'skipped',
  title: string,
}

export type Tester = {
  // From providers
  name: string,
  options?: Object,
  scopes: Array<string>,
  test(textEditor: TextEditor): ?{messages: Array<Message>, output: string} |
                                Promise<?{messages: Array<Message>, output: string}>,
  stop() :void|Promise<any>
}

export type Gutter = {
  decorateMarker: (Object, Object) => void;
}
