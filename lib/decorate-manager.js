'use babel';

/* @flow */
import { $ } from 'atom-space-pen-views';
import _ from 'lodash';
import { convertAnsiStringToHtml, escapeHtml } from './helpers';
/* flow-include
import type { TextEditor } from 'atom';
import type { Gutter } from './types'
*/

export function setInlineMessages(editor/* : TextEditor*/, messages/* : Array<Object>*/) {
  _.forEach(messages, (message) => {
    if (message.state !== 'failed') {
      return;
    }
    const marker = editor.markBufferRange(
        [[message.lineNumber, 0], [message.lineNumber, 0]],
        { invalidate: 'never' },
      );
    let content = message.error.message;
    if (atom.config.get('tester.ansiToHtml')) {
      content = escapeHtml(content);
      content = convertAnsiStringToHtml(content);
    }
    const inlineMessage = $(document.createElement('div'))
      .addClass('inline-block tester-inline-message')
      .html(`${message.error.name}: ${content}`);


    editor.decorateMarker(marker, {
      type: 'block',
      position: 'after',
      item: inlineMessage,
    });
  });
}

export function clearInlineMessages(editor/* : TextEditor*/) {
  editor.getBuffer().getMarkers().forEach((marker) => {
    marker.destroy();
  });
}

export function decorateGutter(editor/* :TextEditor*/, gutter/* :Gutter*/, messages/* : Array<Object>*/) {
  _.forEach(messages, (message) => {
    const tooltipDuration = $(document.createElement('span')).text(`${message.duration}ms`).addClass('highlight-info');
    const tooltipTesterName = $(document.createElement('span')).text('Tester').addClass('highlight');
    const tooltipTesterState = $(document.createElement('span')).append(message.state);
    if (message.state === 'passed') {
      tooltipTesterState.addClass('highlight-success');
    } else if (message.state === 'failed') {
      tooltipTesterState.addClass('highlight-error');
    } else {
      tooltipTesterState.addClass('highlight-warning');
    }
    const tooltipTitle = $(document.createElement('span')).append(tooltipTesterName, tooltipTesterState, tooltipDuration).addClass('inline-block tester-tooltip-title');
    const tooltipError = $(document.createElement('div')).addClass('inline-block example-code show-example-html').text('');
    if (_.has(message.error, 'name')) {
      tooltipError.text(`${message.error.name}: ${message.error.message}`);
    }
    const tooltip = $(document.createElement('div')).append(tooltipTitle, tooltipError).addClass('example');
    const item = $(document.createElement('span')).addClass(`block tester-gutter tester-highlight ${message.state}`);
      // https://atom.io/docs/api/v1.14.4/TooltipManager#instance-add
    atom.tooltips.add(item.get(0), {
      item: tooltip.get(0),
      html: true,
      placement: 'right',
      delay: { show: 100, hide: 100 },
    });
    const marker = editor.getBuffer()
        .markRange([[message.lineNumber, 0], [message.lineNumber, 0]], { invalidate: 'inside' });
    gutter.decorateMarker(marker, {
      class: 'tester-row',
      item: item.get(0),
    });
  });
}
