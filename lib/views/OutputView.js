'use babel';

/** @jsx etch.dom */
/* @flow*/
import etch from 'etch';
import { Emitter, CompositeDisposable, Disposable } from 'atom';
import { convertAnsiStringToHtml, escapeHtml } from '../helpers';

export default class OutputView {
  properties: {
    output: string;
    shouldAnsiToHtml : boolean;
  }
  refs: any;
  element: any;
  panel: any;
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties:Object) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    etch.initialize(this);

    let content = escapeHtml(properties.output);
    if (this.properties.ansiToHtml) {
      content = convertAnsiStringToHtml(content);
    }
    this.refs.output.innerHTML = content;
    this.panel = atom.workspace.addBottomPanel({
      item: this.element,
      visible: true,
      priority: 500,
    });
    // Wait for 1.17 release
    //
    // const item = {
    //   element: this.element,
    //   getTitle() { return 'Tester console output'; },
    //   getDefaultLocation() { return 'bottom'; },
    // };
    // atom.workspace.open(item);

    const scrollToBottomHandler = () => {
      this.refs.output.scrollTop = this.refs.output.scrollHeight;
    };
    this.refs.scrollToBottomButton.addEventListener('click', scrollToBottomHandler);
    this.disposables.add(new Disposable(() => { this.refs.scrollToBottomButton.removeEventListener('click', scrollToBottomHandler); }));

    const scrollToTopHandler = () => {
      this.refs.output.scrollTop = 0;
    };
    this.refs.scrollToTopButton.addEventListener('click', scrollToTopHandler);
    this.disposables.add(new Disposable(() => { this.refs.scrollToTopButton.removeEventListener('click', scrollToTopHandler); }));

    const clearHandler = () => {
      this.update({ output: '' });
    };
    this.refs.clearButton.addEventListener('click', clearHandler);
    this.disposables.add(new Disposable(() => { this.refs.clearButton.removeEventListener('click', clearHandler); }));

    const closeHandler = () => {
      this.close();
    };
    this.refs.closeButton.addEventListener('click', closeHandler);
    this.disposables.add(new Disposable(() => { this.refs.closeButton.removeEventListener('click', closeHandler); }));
  }

  render() {
    return (
      <div class='tester-output-view'>
        <div class='tester-resize-handle' ref='resizer'/>
        <div class='tester-panel-head block highlight'>
          <div class='tester-panel-title inline-block icon icon-terminal' style='cursor: default;'>Tester Output</div>
          <div class='tester-panel-buttons btn-toolbar inline-block pull-right'>
            <div class='tester-panel-scroll-bottom inline-block icon-arrow-down' ref='scrollToBottomButton' title='Scroll to bottom'/>
            <div class='tester-panel-scroll-top inline-block icon-arrow-up' ref='scrollToTopButton' title='Scroll to top'/>
            <div class='tester-panel-clear inline-block icon-circle-slash' ref='clearButton' title='Clear Output'/>
            <div class='tester-panel-close inline-block icon-x' ref='closeButton' title='Close'/>
          </div>
        </div>
        <pre class='output' ref='output'></pre>
      </div>
    );
  }

  update(newProperties:Object) {
    if (this.properties.output !== newProperties.output) {
      let content = escapeHtml(newProperties.output);
      if (this.properties.ansiToHtml) {
        content = convertAnsiStringToHtml(content);
      }
      this.refs.output.innerHTML = content;
      if (this.properties.scrollToBottom) {
        this.refs.output.scrollTop = this.refs.output.scrollHeight;
      }
      return etch.update(this);
    }
    return Promise.resolve();
  }

  async destroy() {
    await etch.destroy(this);
  }

  close() {
    if (this.panel != null) {
      this.panel.destroy();
      this.panel = null;
    }
  }
}
