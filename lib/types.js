'use babel';

// @flow
import type { TextEditor, Disposable } from 'atom';
import type { Observable } from 'rxjs';

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

export type TesterResults = {
  messages: Array<Message>,
  output: string
}

export type Tester = {
  // From providers
  name: string,
  options?: Object,
  scopes: Array<string>,
  test(textEditor: TextEditor, additionalArgs: ?string): ?TesterResults |
                                Promise<?TesterResults>,
  stop(textEditor: ?TextEditor) :void|Promise<any>
}

export type Gutter = {
  decorateMarker: (Object, Object) => void;
}

export type TesterFilter = {
  key: ''|'state'|'duration'|'title'|'error'|'filePath',
  value: ?string,
};

export type TesterSorter = {
  key: ''|'state'|'duration'|'title'|'error'|'filePath',
  desc: ?boolean,
};

export type TesterAction = {
  type: string,
  payload?: ?{
    additionalArgs?: ?string,
    currentFileOnly?: ?boolean,
    currentMessage?: ?Message,
    isProjectTest?: ?boolean,
    messages?: ?Array<Message>,
    output?: ?string,
    rawMessages?: ?Array<Message>,
    sorter?: ?TesterSorter,
    tester?: ?Tester,
  },
  errorMessage?: ?string,
};

export type TesterState = {
  additionalArgs: ?string,
  currentFileOnly: ?boolean,
  currentMessage: ?Message,
  editor: ?TextEditor,
  isProjectTest: ? boolean,
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

export type TesterEpic = (Observable<TesterAction>, Store) => Observable<TesterAction>;

export type SubscribeCallback<T> = (item: T) => any;
export type SubscribeFunction<T> = (callback: SubscribeCallback<T>) => Disposable;
