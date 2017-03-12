'use babel';

/* @flow*/
import AnsiToHtml from 'ansi-to-html';
import { $, ScrollView } from 'atom-space-pen-views';

const entityMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

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

  setConsoleColors() {
    // dark background colors
    let ansiToHtmlOptions = {
      fg: '#FFF',
      bg: '#000',
    };
    // light background colors
    if (atom.themes.getActiveThemeNames().some(themeName => themeName.includes('light'))) {
      ansiToHtmlOptions = {
        fg: '#000',
        bg: '#FFF',
      };
    }
    this.ansiToHtml = new AnsiToHtml(ansiToHtmlOptions);
  }

  escapeHtml(string /* :string*/) {
    return String(string).replace(/[&<>"'`=\/]/g, s => entityMap[s]);
  }

  clear() {
    this.html = '';
  }

  reset() {
    this.html = defaultMessage;
  }

  setContent(content /* :string*/) {
    if (atom.config.get('tester.ansiToHtml')) {
      this.setConsoleColors();
      content = this.escapeHtml(content);
      content = this.ansiToHtml.toHtml(content);
    }
    this.html += content;
    return this;
  }

  finish() {
    this.find('.output').html(this.html);
    if (!this.isVisible() && atom.config.get('tester.showOutputAfterTestRun')) {
      this.show();
      const messageTimeout = atom.config.get('tester.messageTimeout');
      if (messageTimeout && messageTimeout !== 0) {
        this.timeout = setTimeout(() =>
              this.hide(), atom.config.get('tester.messageTimeout') * 1000);
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
