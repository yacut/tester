'use babel';

/* @flow */

import { Disposable, CompositeDisposable } from 'atom';

import 'rxjs';
import { createStore, applyMiddleware } from 'redux';
import { createEpicMiddleware } from 'redux-observable';
import reducers from './redux/reducers';
import epics from './redux/epics';
import {
  addTesterAction,
  clearAction,
  goToNextTestAction,
  goToPreviousTestAction,
  removeTesterAction,
  setAdditionalArgsAction,
  setEditorAction,
  setFilterAction,
  setResultViewColumns,
  setSortByAction,
  stopTestAction,
  testAction,
  testLastAction,
  testProjectAction,
} from './redux/actions';

import Commands from './commands';
import ConsoleOutputView from './views/ConsoleOutputView';
import ResultView from './views/ResultView';
import StatusBarTile from './views/StatusBarTile';
import type { Store, TesterSorter, Column, WidthMap } from './types';

class Tester {
  commands: Commands;
  subscriptions: CompositeDisposable;
  statusBarTile: Object;
  consoleView: ?ConsoleOutputView;
  resultView: ?ResultView;
  deserializeResultView: Function;
  deserializeConsoleOutput: Function;
  store: Store;
  getStore: Function;

  constructor(initialState) {
    this.commands = new Commands();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.commands);
    const self = this;

    this.getStore = () => {
      if (self.store == null) {
        initialState = Object.assign({
          additionalArgs: '',
          currentFileOnly: false,
          currentMessage: null,
          editor: null,
          isProjectTest: false,
          messages: [],
          output: '',
          rawMessages: [],
          sorter: { key: '', desc: false },
          testers: [],
          testRunning: false,
        }, initialState);

        self.store = createStore(
          reducers,
          initialState,
          applyMiddleware(createEpicMiddleware(epics)),
        );

        self.store.subscribe(async () => {
          const currentState = self.getStore().getState();
          if (self.statusBarTile) {
            await self.statusBarTile.update(currentState);
          }
          if (this.resultView) {
            await this.resultView.update(currentState);
          }
          if (this.consoleView) {
            await this.consoleView.update(currentState);
          }
        });
      }
      return self.store;
    };

    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((paneItem: any) => {
      if (atom.workspace.isTextEditor(paneItem)) {
        self.getStore().dispatch(setEditorAction(paneItem));
        self.getStore().dispatch(setFilterAction(null));
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
      self.consoleView = new ConsoleOutputView({
        state: self.getStore().getState(),
      });
      return self.consoleView;
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
      const resultView = new ResultView({
        state: self.getStore().getState(),
        softWrap: atom.config.get('tester.softWrapDefault'),
      });
      resultView.onTestButtonClick(() => {
        self.getStore().dispatch(testProjectAction());
      });
      resultView.onSortByClick((sorter: TesterSorter) => {
        if (sorter && sorter.key) {
          self.getStore().dispatch(setSortByAction(sorter));
        }
      });
      resultView.onCurrentFileOnlyClick((currentFileOnly: boolean) => {
        self.getStore().dispatch(setFilterAction(currentFileOnly));
      });
      resultView.onClearButtonClick(() => {
        self.getStore().dispatch(clearAction());
      });
      resultView.onSetAdditionalArgs((additionalArgs: ?string) => {
        self.getStore().dispatch(setAdditionalArgsAction(additionalArgs));
      });
      resultView.onSetResultViewColumns((resultViewColumns: {
          columns: Array<Column>;
          columnWidthRatios: WidthMap;
        }) => {
        self.getStore().dispatch(setResultViewColumns(resultViewColumns));
      });
      self.resultView = resultView;
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
    this.commands.onShouldClear(() => {
      self.getStore().dispatch(clearAction());
    });
    this.commands.onShouldToggleTesterOutput(() => {
      this.toggleConsoleView();
    });
    this.commands.onShouldToggleTesterResultView(() => {
      this.toggleResultView();
    });
    this.commands.onShouldGoToNextTest(() => {
      self.getStore().dispatch(goToNextTestAction());
    });
    this.commands.onShouldGoToPreviousTest(() => {
      self.getStore().dispatch(goToPreviousTestAction());
    });
  }

  createStatusBar(statusBar : Object) {
    if (!atom.config.get('tester.showStatusBar')) {
      return;
    }
    const onclick = () => {
      const statusBarOnClick = atom.config.get('tester.statusBarOnClick');
      if (statusBarOnClick === 'console' || statusBarOnClick === 'both') {
        this.toggleConsoleView();
      }
      if (statusBarOnClick === 'results' || statusBarOnClick === 'both') {
        this.toggleResultView();
      }
    };
    this.statusBarTile = new StatusBarTile({ state: this.getStore().getState(), onclick });

    if (atom.config.get('tester.statusBarPosition') === 'Right') {
      statusBar.addRightTile({
        item: this.statusBarTile.element,
        priority: atom.config.get('tester.statusBarPriority'),
      });
    } else {
      statusBar.addLeftTile({
        item: this.statusBarTile.element,
        priority: atom.config.get('tester.statusBarPriority'),
      });
    }
  }

  toggleConsoleView() {
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
    if (this.consoleView) {
      await this.consoleView.destroy();
    }
    if (this.resultView) {
      await this.resultView.destroy();
    }
    this.subscriptions.dispose();
  }
}

export default {
  instance: null,
  consumeStatusBar(statusBar: any) {
    this.instance.createStatusBar(statusBar);
  },

  initialize(initialState: any) {
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
