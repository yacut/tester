'use babel';

// @flow

import { Emitter, CompositeDisposable } from 'atom';
import debounce from 'sb-debounce';
import type { TextEditor, Disposable } from 'atom';

export default class EditorTester {
  editor: TextEditor;
  emitter: Emitter;
  subscriptions: CompositeDisposable;


  constructor(editor : TextEditor) {
    if (!atom.workspace.isTextEditor(editor)) {
      return;
    }

    this.editor = editor;
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(this.editor.onDidDestroy(() =>
      this.dispose(),
    ));
    this.subscriptions.add(this.editor.onDidSave(debounce(() => {
      if (atom.config.get('tester.testOnSave')) {
        this.emitter.emit('should-test', false);
      }
      if (atom.config.get('tester.experimental.testAllOpenedOnAnySave')) {
        this.emitter.emit('should-test-all-opened');
      }
    },
    ), 16, true));
  }
  getEditor() : TextEditor {
    return this.editor;
  }
  test() {
    this.emitter.emit('should-test');
  }
  stop() {
    this.emitter.emit('should-stop');
  }
  onShouldTest(callback : Function) : Disposable {
    if (!this.emitter) return;
    return this.emitter.on('should-test', callback);
  }
  onShouldTestAllOpened(callback : Function) : Disposable {
    if (!this.emitter) return;
    return this.emitter.on('should-test-all-opened', callback);
  }
  onShouldStop(callback : Function) : Disposable {
    if (!this.emitter) return;
    return this.emitter.on('should-stop', callback);
  }
  onDidDestroy(callback : Function) : Disposable {
    if (!this.emitter) return;
    return this.emitter.on('did-destroy', callback);
  }
  dispose() {
    this.emitter.emit('did-destroy');
    this.subscriptions.dispose();
    this.emitter.dispose();
  }
}
