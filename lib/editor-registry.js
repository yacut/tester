'use babel';

// @flow

import { Emitter, CompositeDisposable } from 'atom';
import type { Disposable, TextEditor } from 'atom';
import EditorTester from './editor-tester';

export default class EditorRegistry {
  emitter: Emitter;
  testOnOpen: boolean;
  subscriptions: CompositeDisposable;
  editorTesters: Map<TextEditor, EditorTester>;
  gutter: any;
  gutterEnabled: boolean;


  constructor() {
    this.emitter = new Emitter();
    this.subscriptions = new CompositeDisposable();
    this.editorTesters = new Map();
    this.gutter = null;
    this.gutterEnabled = false;

    this.subscriptions.add(this.emitter);
    this.subscriptions.add(atom.config.observe('tester.testOnOpen', (testOnOpen) => {
      this.testOnOpen = testOnOpen;
    }));
  }

  activate() {
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      this.createFromTextEditor(textEditor);
    }));
    this.subscriptions.add(atom.workspace.onDidChangeActivePaneItem((paneItem) => {
      if (paneItem === atom.workspace.getActiveTextEditor()) {
        this.createFromTextEditor(paneItem);
      }
    }));
    this.subscriptions.add(atom.workspace.observeActivePaneItem((paneItem) => {
      if (paneItem === atom.workspace.getActiveTextEditor()) {
        this.createFromTextEditor(paneItem);
      }
    }));
  }

  get(textEditor : TextEditor) : ?EditorTester {
    return this.editorTesters.get(textEditor);
  }

  createFromTextEditor(textEditor : TextEditor) : EditorTester {
    const isTextEditor = atom.workspace.isTextEditor(textEditor);
    if (isTextEditor) {
      this.handleGutter(textEditor);
    }
    let editorTester = this.editorTesters.get(textEditor);
    if (!editorTester) {
      editorTester = new EditorTester(textEditor);
      if (editorTester) {
        editorTester.onDidDestroy(() => {
          this.editorTesters.delete(textEditor);
        });
        this.editorTesters.set(textEditor, editorTester);
        this.emitter.emit('observe', editorTester);
      }
    }
    if (this.testOnOpen && Boolean(editorTester) && isTextEditor) {
      editorTester.test();
    }
    return editorTester;
  }

  observe(callback : ((editorTester: EditorTester) => void)) : Disposable {
    this.editorTesters.forEach(callback);
    return this.emitter.on('observe', callback);
  }

  dispose() {
    for (const entry of this.editorTesters.values()) {
      this.removeGutter(entry);
      entry.dispose();
    }
    this.subscriptions.dispose();
  }

  handleGutter(textEditor :TextEditor) {
    if (!textEditor) {
      return null;
    }
    if (textEditor.gutter !== null) {
      this.removeGutter(textEditor);
    }
    if (this.gutterEnabled) {
      this.addGutter(textEditor);
    }
    return textEditor.gutter;
  }

  addGutter(textEditor :TextEditor) {
    const position = atom.config.get('tester.gutterPosition');
    if (textEditor && !textEditor.gutter) {
      textEditor.gutter = textEditor.addGutter({
        name: 'tester',
        priority: position === 'Left' ? -100 : 100,
      });
    }
  }

  removeGutter(textEditor :TextEditor) {
    if (textEditor.gutter !== null && textEditor.gutter) {
      try {
        // Atom throws when we try to remove a gutter container from a closed text editor
        textEditor.gutter.destroy();
      } catch (error) {
        console.error('Tester: ', error);
      }
      textEditor.gutter = null;
    }
  }
}
