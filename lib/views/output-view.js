'use babel';

/* @flow*/
import AnsiToHtml from 'ansi-to-html';
import { $, ScrollView } from 'atom-space-pen-views';

const ansiToHtml = new AnsiToHtml();
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

  reset() {
    this.html = defaultMessage;
  }

  setContent(content /* :string*/) {
    this.html = ansiToHtml.toHtml(content);
    return this;
  }

  finish() {
    this.find('.output').html(this.html);
    this.show();
    this.scrollToBottom();
    const messageTimeout = atom.config.get('tester.messageTimeout');
    if (messageTimeout && messageTimeout !== 0) {
      this.timeout = setTimeout(() =>
            this.hide(), atom.config.get('tester.messageTimeout') * 1000);
    }
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
