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
      class: 'tester-output-view',
    }, () => {
      this.div({
        class: 'tester-resize-handle',
        style: 'position: absolute; top: 0; left: 0; right: 0; height: 10px; cursor: row-resize; z-index: 3',
      });

      this.div({
        class: 'tester-panel-head block',
      }, () => {
        this.div({
          class: 'tester-panel-title inline-block',
          style: 'cursor: pointer',
          outlet: 'heading',
          click: 'toggle',
        }, 'Tester Output');
        this.div({
          class: 'tester-panel-buttons btn-toolbar inline-block pull-right',
        }, () => {
          this.button({
            class: 'tester-panel-clear inline-block btn btn-sm',
            style: 'cursor: pointer;',
            outlet: 'btnClear',
            click: 'clear',
          }, 'clear');
          this.button({
            class: 'tester-panel-close inline-block btn btn-sm',
            style: 'cursor: pointer;',
            outlet: 'btnClose',
            click: 'close',
          }, 'close');
        });
      });

      this.pre({
        class: 'output',
      }, defaultMessage);
    });
  }

  initialize() {
    this.find('.tester-resize-handle').mousedown(() => this.resizeStarted());
    return super.initialize(...arguments);
  }

  resizeStarted() {
    $(this).css({
      WebkitUserSelect: 'none',
    });

    $(document).on('mousemove', { that: this }, this.resizePanel);
    $(document).on('mouseup', { that: this }, this.resizeStopped);
  }

  resizeStopped(e/* :Object*/) {
    $(e.data.that).css({
      WebkitUserSelect: '',
    });

    $(document).off('mousemove', this.resizePanel);
    $(document).off('mouseup', this.resizeStopped);
  }

  resizePanel(e/* :Object*/) {
    const panelBody = $('.output', e.data.that);
    const newHeight = $(document.body).height() - e.pageY - 30;

    if (newHeight <= 300) {
      panelBody.css({
        height: newHeight,
        maxHeight: newHeight,
      });
    }
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

  close() {
    this.hide();
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
