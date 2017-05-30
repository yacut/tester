'use babel';

/* @flow */

import { Disposable, CompositeDisposable } from 'atom';
import type { Panel, TextEditor } from 'atom';
import Commands from './commands';
import EditorsRegistry from './editor-registry';
import TesterRegistry from './tester-registry';
import { clearDecoratedGutter, clearInlineMessages, decorateGutter, setInlineMessages } from './decorate-manager';
import ConsoleOutputView from './views/ConsoleOutputView';
import ResultView from './views/ResultView';
import StatusBarTile from './views/StatusBarTile';
import type { Tester as TesterProvider, Message } from './types';

class Tester {
  commands: Commands;
  subscriptions: CompositeDisposable;
  modalPanel: Panel;
  registryTesters: TesterRegistry;
  registryEditors: EditorsRegistry;
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

  constructor() {
    this.commands = new Commands();
    this.registryEditors = new EditorsRegistry();
    this.registryTesters = new TesterRegistry();
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(this.commands);
    this.subscriptions.add(this.registryEditors);
    this.subscriptions.add(this.registryTesters);
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

    this.subscriptions.add(atom.config.observe('tester.gutterEnabled', (gutterEnabled) => {
      this.registryEditors.gutterEnabled = gutterEnabled;
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
    this.subscriptions.add(atom.workspace.observeTextEditors(async (/* editor*/) => {
      await self.updateStatusBar();
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem(async (/* paneItem*/) => {
      await self.updateStatusBar();
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
        output: self.output,
        ansiToHtml: self.ansiToHtml,
        scrollToBottom: self.scrollToBottom });
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
        messages: self.messages,
        ansiToHtml: self.ansiToHtml,
        softWrap: atom.config.get('tester.softWrapDefault'),
        runningTestersCount: self.runningTestersCount,
      });
      self.resultView.onTestButtonClick((additionalArgs) => {
        self.registryTesters.test(null, true, additionalArgs);
      });
      return self.resultView;
    };

    this.subscriptions.add(atom.workspace.addOpener((uri) => {
      if (uri === 'atom://tester-result-view') {
        return self.deserializeResultView();
      }
    }));

    const onShouldTestHandler = async () => {
      if (!self.lastTestEditor) {
        self.lastTestEditor = atom.workspace.getActiveTextEditor();
      }
      const activeItem = self.lastTestEditor || atom.workspace.getActivePaneItem();
      const editorTester = self.registryEditors.get(activeItem);

      if (editorTester) {
        await self.updateStatusBar();
        editorTester.test();
      }
    };
    const onShouldTestProjectHandler = () => {
      self.registryTesters.test(null, true, self.resultView ? self.resultView.getAdditionalArgs() : '');
    };

    this.commands.onShouldTestLast(() => {
      if (self.lastTestEditor) {
        onShouldTestHandler();
      } else {
        onShouldTestProjectHandler();
      }
    });

    this.commands.onShouldTestProject(onShouldTestProjectHandler);

    this.commands.onShouldTest(onShouldTestHandler);

    this.commands.onShouldStop(() => {
      self.registryTesters.stop(atom.workspace.getActiveTextEditor());
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

    this.registryEditors.observe((editorTester) => {
      editorTester.onShouldTest(() => {
        self.registryTesters.test(editorTester, null, self.resultView ? self.resultView.getAdditionalArgs() : '');
      });
      editorTester.onShouldStop(() => {
        self.registryTesters.stop(editorTester);
      });
    });

    this.registryTesters.onDidUpdateMessages(async ({ editor, messages, output }) => {
      messages.forEach((message, index) => {
        if (!message || typeof message !== 'object') {
          messages.splice(index, 1);
          console.warn('Tester: Message is not valid. Remove it from globals.', message);
        }
      });
      this.messages = messages;
      this.output = output;
      await self.updateStatusBar();
      if (this.panel) {
        await this.panel.update({ output });
      }
      if (this.resultView) {
        await this.resultView.update({ messages: this.messages });
      }

      if (editor) {
        const gutter = self.registryEditors.handleGutter(editor);
        if (!gutter) {
          return;
        }
        clearDecoratedGutter(editor, gutter);
        clearInlineMessages(editor);
        decorateGutter(editor, gutter, this.messages);
        if (this.showInlineError) {
          setInlineMessages(editor, this.messages, this.ansiToHtml, this.inlineErrorPosition);
        }
      }
    });

    this.registryTesters.onDidBeginTesting(async ({ editorTester }) => {
      self.lastTestEditor = editorTester ? editorTester.editor : null;
      self.runningTestersCount += 1;
      if (self.resultView) {
        await self.resultView.update({ runningTestersCount: self.runningTestersCount });
      }
      await self.updateStatusBar();
    });

    this.registryTesters.onDidFinishTesting(async () => {
      self.runningTestersCount -= 1;
      if (self.resultView) {
        await self.resultView.update({ runningTestersCount: self.runningTestersCount });
      }
      await self.updateStatusBar();
    });

    this.registryEditors.activate();

    setTimeout(() => {
      // NOTE: Atom triggers this on boot so wait a while
      if (!self.subscriptions.disposed) {
        self.subscriptions.add(atom.project.onDidChangePaths(() => {
          self.registryEditors.handleGutter();
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
    this.statusBarTile = new StatusBarTile({
      messages: this.messages,
      runningTestersCount: this.runningTestersCount,
      onclick,
    });

    statusBar.addLeftTile({
      item: this.statusBarTile.element,
      priority: -50,
    });
  }

  async updateStatusBar() {
    if (this.statusBarTile) {
      await this.statusBarTile.update({
        messages: this.messages,
        runningTestersCount: this.runningTestersCount,
      });
    }
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

  addTester(tester : TesterProvider) {
    this.registryTesters.addTester(tester);
  }

  deleteTester(tester : TesterProvider) {
    this.registryTesters.deleteTester(tester);
  }
}

export default {
  instance: null,
  consumeStatusBar(statusBar : any) {
    this.instance.createStatusBar(statusBar);
  },

  initialize() {
    this.instance = new Tester();
    this.deserializeResultView = this.instance.deserializeResultView;
    this.deserializeConsoleOutput = this.instance.deserializeConsoleOutput;
  },

  getInstance(): ?Tester {
    return this.instance;
  },

  consumeTester(tester : Tester) : Disposable {
    const testers = [].concat(tester);
    for (const entry of testers) {
      this.instance.addTester(entry);
    }
    return new Disposable(() => {
      for (const entry of testers) {
        this.instance.deleteTester(entry);
      }
    });
  },

  deactivate() {
    this.instance.dispose();
  },
};
