'use babel';
/* @flow */

import { Emitter, CompositeDisposable } from 'atom'
import type { Disposable, TextEditor } from 'atom'
import EditorTester from './editor-tester'

export default class EditorRegistry {
  /*::
  emitter: Emitter;
  testOnOpen: boolean; 
  subscriptions: CompositeDisposable;
  editorTesters: Map<TextEditor, EditorTester>;
  */

  constructor() {
    this.emitter = new Emitter()
    this.subscriptions = new CompositeDisposable()
    this.editorTesters = new Map()

    this.subscriptions.add(this.emitter)
    this.subscriptions.add(atom.config.observe('tester.testOnOpen', (testOnOpen) => {
      this.testOnOpen = testOnOpen
    }))
  }
  activate() {
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      this.createFromTextEditor(textEditor)
    }))
  }
  get(textEditor/*: TextEditor*/)/*: ?EditorTester*/ {
    return this.editorTesters.get(textEditor)
  }
  createFromTextEditor(textEditor/*: TextEditor*/)/*: EditorTester*/ {
    let editorTester = this.editorTesters.get(textEditor)
    if (editorTester) {
      return editorTester
    }
    editorTester = new EditorTester(textEditor)
    editorTester.onDidDestroy(() => {
      this.editorTesters.delete(textEditor)
    })
    this.editorTesters.set(textEditor, editorTester)
    this.emitter.emit('observe', editorTester)
    if (this.testOnOpen) {
      editorTester.test()
    }
    return editorTester
  }
  observe(callback/*: ((editorTester: EditorTester) => void)*/)/*: Disposable*/ {
    this.editorTesters.forEach(callback)
    return this.emitter.on('observe', callback)
  }
  dispose() {
    for (const entry of this.editorTesters.values()) {
      entry.dispose()
    }
    this.subscriptions.dispose()
  }
}
