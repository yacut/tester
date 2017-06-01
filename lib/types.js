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

export type TesterFilter = {
  key: ''|'state'|'duraction'|'title'|'error'|'filePath',
  value: ?string,
};

export type TesterSorter = {
  key: ''|'state'|'duraction'|'title'|'error'|'filePath',
  desc: ?boolean,
};

export type TesterAction = {
  type: string,
  payload?: ?{
    filter?: ?TesterFilter,
    messages?: ?Array<Message>,
    output?: ?string,
    sorter?: ?TesterSorter,
    tester?: ?Tester,
  },
  errorMessage?: ?string,
};

export type TesterState = {
  currentMessage: ?Message,
  editor: ?TextEditor,
  filter: TesterFilter,
  messages: Array<Message>,
  output: ?string,
  rawMessages: Array<Message>,
  sorter: TesterSorter,
  testers: Array<Tester>,
  testRunning: boolean,
};

export type Store = {
  getState(): TesterState,
  dispatch(action: TesterAction): void,
};
