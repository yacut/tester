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
  test(textEditor: TextEditor, additionalArgs: ?string): ?{messages: Array<Message>, output: string} |
                                Promise<?{messages: Array<Message>, output: string}>,
  stop(textEditor: ?TextEditor) :void|Promise<any>
}

export type Gutter = {
  decorateMarker: (Object, Object) => void;
}

export type TesterAction = {
  type: string,
  payload?: ?{
    messages?: ?Array<Message>,
    output?: ?string,
  },
  errorMessage?: ?string,
};

export type TesterState = {
  messages: Array<Message>,
  output: ?string,
  testRunning: boolean,
  editor: ?TextEditor,
  sort: {
    byKey: ''|'state'|'duraction'|'title'|'error'|'filePath',
    desc: ?boolean,
  },
  filter: {
    pattern: ?string,
    currentFileOnly: ? boolean,
  }
};

export type Store = {
  getState(): {results: TesterState},
  dispatch(action: TesterAction): void,
};
