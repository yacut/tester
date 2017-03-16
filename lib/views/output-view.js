'use babel';

/* @flow*/
import { $, ScrollView } from 'atom-space-pen-views';
import { convertAnsiStringToHtml, escapeHtml } from '../helpers';

const defaultMessage = 'Nothing new to show';

class OutputView extends ScrollView {
  static initClass() {
    this.prototype.html = defaultMessage;
  }
  static content() {
    return this.div({
      class: 'tester output-view',
    }, () => this.pre({
      class: 'output',
    }, defaultMessage));
  }

  initialize() {
    return super.initialize(...arguments);
  }

  clear() {
    this.html = '';
  }

  reset() {
    this.html = defaultMessage;
  }

  setContent(content /* :string*/, shouldAnsiToHtml /* : boolean*/) {
    content = escapeHtml(content);
    if (shouldAnsiToHtml) {
      content = convertAnsiStringToHtml(content);
    }
    this.html += content;
    return this;
  }

  finish(showOutputAfterTestRun/* :boolean*/, messageTimeout/* :number*/) {
    this.find('.output').html(this.html);
    if (!this.isVisible() && showOutputAfterTestRun) {
      this.show();
      if (messageTimeout && messageTimeout !== 0) {
        this.timeout = setTimeout(() =>
              this.hide(), messageTimeout * 1000);
      }
    }
    this.scrollToBottom();
  }

  toggle() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    return $.fn.toggle.call(this);
  }
}
OutputView.initClass();

export default OutputView;
