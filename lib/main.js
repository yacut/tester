'use babel';

/* @flow */

import { Disposable, CompositeDisposable } from 'atom';
import type { Panel, TextEditor } from 'atom';

import 'rxjs';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import reducers from './redux/reducers';
import epics from './redux/epics';
import {
  addTesterAction,
  removeTesterAction,
  updateEditorAction,
  testAction,
  testLastAction,
  testProjectAction,
  stopTestAction,
  sortMessagesAction,
} from './redux/actions';

import Commands from './commands';
import ConsoleOutputView from './views/ConsoleOutputView';
import ResultView from './views/ResultView';
import StatusBarTile from './views/StatusBarTile';
import type { Message, Store, TesterSorter } from './types';

// TODO move all config to redux state
// TODO Move tester registration to redux
// TODO Move start/stop test to redux actions
class Tester {
  commands: Commands;
  subscriptions: CompositeDisposable;
  modalPanel: Panel;
  statusBarTile: Object;
  markers: Array<Object>;
  showInlineError: boolean;
  inlineErrorPosition: string;
  ansiToHtml: boolean;
  showOutputAfterTestRun: boolean;
  showNotifications: boolean;
  messageTimeout: number;
  runningTestersCount: number;
  scrollToBottom: boolean;
  panel: ?ConsoleOutputView;
  resultView: ?ResultView;
  messages:Array<Message>;
  output: string;
  testerStatusBar: Object;
  lastTestEditor: TextEditor;
  deserializeResultView: Function;
  deserializeConsoleOutput: Function;
  store: Store;
  getStore: Function;

  constructor(initialState) {
    this.commands = new Commands();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.commands);
    this.markers = [];
    this.showInlineError = true;
    this.inlineErrorPosition = 'after';
    this.ansiToHtml = true;
    this.showOutputAfterTestRun = true;
    this.showNotifications = true;
    this.messageTimeout = 5;
    this.runningTestersCount = 0;
    this.scrollToBottom = true;
    this.messages = [];
    this.output = '';
    this.lastTestEditor = null;
    const self = this;

    this.getStore = () => {
      if (self.store == null) {
        initialState = Object.assign({
          rawMessages: [],
          currentMessage: null,
          messages: [],
          output: '',
          testRunning: false,
          editor: null,
          sorter: { key: '', desc: false },
          filter: { key: '', value: '' },
          testers: [],
          additionalArgs: '',
        }, {}); // initialState);

        self.store = createStore(
          reducers,
          initialState,
          applyMiddleware(createEpicMiddleware(epics)),
        );

        self.store.subscribe(async () => {
          const currentState = self.getStore().getState();
          console.log('store updated', currentState);
          if (self.statusBarTile) {
            await self.statusBarTile.update(currentState);
          }
          if (this.resultView) {
            await this.resultView.update(currentState);
          }
          if (this.panel) {
            await this.panel.update(currentState);
          }
        });
      }
      return self.store;
    };
    this.subscriptions.add(atom.config.observe('tester.gutterEnabled', (/* gutterEnabled*/) => {
      // TODO
    }));
    this.subscriptions.add(atom.config.observe('tester.showInlineError', (showInlineError) => {
      this.showInlineError = showInlineError;
    }));
    this.subscriptions.add(atom.config.observe('tester.inlineErrorPosition', (inlineErrorPosition) => {
      this.inlineErrorPosition = inlineErrorPosition;
    }));
    this.subscriptions.add(atom.config.observe('tester.ansiToHtml', (ansiToHtml) => {
      this.ansiToHtml = ansiToHtml;
    }));
    this.subscriptions.add(atom.config.observe('tester.showOutputAfterTestRun', (showOutputAfterTestRun) => {
      this.showOutputAfterTestRun = showOutputAfterTestRun;
    }));
    this.subscriptions.add(atom.config.observe('tester.messageTimeout', (messageTimeout) => {
      this.messageTimeout = messageTimeout;
    }));
    this.subscriptions.add(atom.config.observe('tester.showNotifications', (showNotifications) => {
      this.showNotifications = showNotifications;
    }));
    this.subscriptions.add(atom.config.observe('tester.scrollToBottom', (scrollToBottom) => {
      this.scrollToBottom = scrollToBottom;
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((paneItem: any) => {
      if (atom.workspace.isTextEditor(paneItem)) {
        self.getStore().dispatch(updateEditorAction(paneItem));
      }
    }));

    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (item instanceof ConsoleOutputView) {
          item.destroy();
        }
      });
    }));

    this.deserializeConsoleOutput = function deserializeConsoleOutput() {
      self.panel = new ConsoleOutputView({
        state: self.getStore().getState(),
        ansiToHtml: self.ansiToHtml,
        scrollToBottom: self.scrollToBottom,
      });
      return self.panel;
    };

    this.subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === 'atom://tester-console-output') {
        return self.deserializeConsoleOutput();
      }
    }));

    this.subscriptions.add(new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (item instanceof ResultView) {
          item.destroy();
        }
      });
    }));

    this.deserializeResultView = function deserializeResultView() {
      self.resultView = new ResultView({
        state: self.getStore().getState(),
        ansiToHtml: self.ansiToHtml,
        softWrap: atom.config.get('tester.softWrapDefault'),
      })
      .onTestButtonClick((additionalArgs: string) => {
        self.getStore().dispatch(testProjectAction(additionalArgs));
      })
      .onSortByClick((sorter: TesterSorter) => {
        if (sorter && sorter.key) {
          self.getStore().dispatch(sortMessagesAction(sorter));
        }
      });
      // TODO add handler for filter and sort
      return self.resultView;
    };

    this.subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === 'atom://tester-result-view') {
        return self.deserializeResultView();
      }
    }));

    this.commands.onShouldTestLast(() => {
      self.getStore().dispatch(testLastAction());
    });

    this.commands.onShouldTestProject(() => {
      self.getStore().dispatch(testProjectAction());
    });

    this.commands.onShouldTest(() => {
      self.getStore().dispatch(testAction());
    });

    this.commands.onShouldStop(() => {
      self.getStore().dispatch(stopTestAction());
    });

    this.commands.onShouldToggleTesterOutput(() => {
      this.togglePanel();
    });
    this.commands.onShouldToggleTesterResultView(() => {
      this.toggleResultView();
    });

    this.commands.onShouldGoToNextTest(() => {
      if (!this.resultView) { return; }
      this.resultView.goToNextTest();
    });
    this.commands.onShouldGoToPreviousTest(() => {
      if (!this.resultView) { return; }
      this.resultView.goToPreviousTest();
    });

    setTimeout(() => {
      // NOTE: Atom triggers this on boot so wait a while
      if (!self.subscriptions.disposed) {
        self.subscriptions.add(atom.project.onDidChangePaths(() => {
          self.commands.test();
        }));
      }
    }, 100);
  }

  createStatusBar(statusBar : Object) {
    if (!atom.config.get('tester.showStatusBar')) {
      return;
    }
    const onclick = () => {
      const statusBarOnClick = atom.config.get('tester.statusBarOnClick');
      if (statusBarOnClick === 'console' || statusBarOnClick === 'both') {
        this.togglePanel();
      }
      if (statusBarOnClick === 'results' || statusBarOnClick === 'both') {
        this.toggleResultView();
      }
    };
    this.statusBarTile = new StatusBarTile({ state: this.getStore().getState(), onclick });

    statusBar.addLeftTile({
      item: this.statusBarTile.element,
      priority: -50,
    });
  }

  togglePanel() {
    if (atom.getVersion() < '1.17') {
      return atom.notifications.addWarning('Please update atom to version >=1.17 to use tester dock views.');
    }
    atom.workspace.toggle('atom://tester-console-output');
  }

  toggleResultView() {
    if (atom.getVersion() < '1.17') {
      return atom.notifications.addWarning('Please update atom to version >=1.17 to use tester dock views.');
    }
    atom.workspace.toggle('atom://tester-result-view');
  }

  async dispose() {
    if (this.statusBarTile) {
      await this.statusBarTile.destroy();
    }
    if (this.panel) {
      await this.panel.destroy();
    }
    if (this.resultView) {
      await this.resultView.destroy();
    }
    this.subscriptions.dispose();
  }
}

export default {
  instance: null,
  consumeStatusBar(statusBar : any) {
    this.instance.createStatusBar(statusBar);
  },

  initialize(initialState: any) {
    console.log('initialState', initialState);
    this.instance = new Tester(initialState);
    this.deserializeResultView = this.instance.deserializeResultView;
    this.deserializeConsoleOutput = this.instance.deserializeConsoleOutput;
  },

  getInstance(): ?Tester {
    return this.instance;
  },

  consumeTester(tester: Tester) : Disposable {
    if (!tester || !tester.name || !tester.scopes || !tester.test || !tester.stop) {
      atom.notifications.addError('Tester: Could not registry a test provider.');
      return;
    }
    // $FlowIgnore
    this.instance.getStore().dispatch(addTesterAction(tester));
    return new Disposable(() => {
      // $FlowIgnore
      this.instance.getStore().dispatch(removeTesterAction(tester));
    });
  },

  serialize() {
    if (!this.instance) {
      return {};
    }
    const state = Object.assign({}, this.instance.getStore().getState());
    state.testRunning = false;
    state.testers = [];
    delete state.editor;
    return state;
  },

  deactivate() {
    this.instance.dispose();
  },
};
