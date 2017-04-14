'use babel';

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
  emitter: Emitter;
  disposables: CompositeDisposable;

  constructor(properties:Object) {
    this.properties = properties;
    this.emitter = new Emitter();
    this.disposables = new CompositeDisposable();
    etch.initialize(this);
    this.refs.scrollToTopButton.addEventListener('click', this.scrollToTop);
    this.disposables.add(new Disposable(() => { this.refs.scrollToTopButton.removeEventListener('click', this.scrollToTop); }));
  }

  render() {
    return <div class='tester-output-view'>
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
            <pre class='output' style='height: 60px; max-height: 60px;'>{this.properties.output}</pre>
          </div>;
  }

  update(newProperties:Object) {
    if (this.properties.output !== newProperties.output) {
      let content = escapeHtml(newProperties.output);
      if (newProperties.shouldAnsiToHtml) {
        content = convertAnsiStringToHtml(content);
      }
      this.properties.output = content;
      if (newProperties.scrollToBottom) {
        this.scrollToBottom();
      }
      return etch.update(this);
    }
    return Promise.resolve();
  }

  async destroy() {
    await etch.destroy(this);
  }

  scrollToTop() {
    this.element.scrollTop = 0;
  }

  scrollToBottom() {
    this.element.scrollTop = this.element.scrollHeight;
  }

}
