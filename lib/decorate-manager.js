'use babel';

// @flow
import { get, forEach } from 'lodash';
import type { TextEditor } from 'atom';
import { convertAnsiStringToHtml, escapeHtml } from './helpers';
import type { Gutter } from './types';

export function setInlineMessages(editor : TextEditor, messages : Array<Object>, shouldAnsiToHtml : boolean, inlineErrorPosition :string) {
  if (!editor) {
    return;
  }
  forEach(messages, (message) => {
    let content = get(message, 'error.message');
    if (!content) {
      return;
    }
    const rowRange = editor.getBuffer().rangeForRow(message.lineNumber);
    const marker = editor.markBufferRange(
        rowRange,
        { invalidate: 'never' },
      );
    content = escapeHtml(content);
    if (shouldAnsiToHtml) {
      content = convertAnsiStringToHtml(content, shouldAnsiToHtml);
    }
    if (message.error.name && message.error.name !== '') {
      content = `${message.error.name}: ${content}`;
    }
    const inlineMessage = document.createElement('div');
    inlineMessage.classList.add('inline-block', 'tester-inline-message');
    inlineMessage.innerHTML = content;
    inlineMessage.onclick = () => this.classList.toggle('full-size');

    if (inlineErrorPosition === 'tail') {
      editor.decorateMarker(marker, {
        type: 'overlay',
        class: 'tester-inline-message-tail',
        item: inlineMessage,
      });
    } else {
      editor.decorateMarker(marker, {
        type: 'block',
        position: inlineErrorPosition,
        item: inlineMessage,
      });
    }

    if (!editor.testerMarkers) {
      editor.testerMarkers = [];
    }
    editor.testerMarkers.push(marker);
  });
}

export function clearInlineMessages(editor : TextEditor) {
  if (!editor) {
    return;
  }
  editor.getBuffer().getMarkers().forEach((marker) => {
    if (!marker.isDestroyed()) {
      marker.destroy();
    }
  });
  if (editor.testerMarkers && editor.testerMarkers.length > 0) {
    editor.testerMarkers.forEach((marker) => {
      if (!marker.isDestroyed()) {
        marker.destroy();
      }
    });
  }
}

export function decorateGutter(editor :TextEditor, gutter :Gutter, messages : Array<Object>) {
  if (!editor || !gutter) {
    return;
  }
  forEach(messages, (message) => {
    const tooltipDuration = document.createElement('span');
    tooltipDuration.classList.add('highlight-info');
    if (message.duration) {
      tooltipDuration.textContent = `${message.duration}ms`;
    }
    const tooltipTesterName = document.createElement('span');
    tooltipTesterName.textContent = 'Tester';
    tooltipTesterName.classList.add('highlight');

    const tooltipTesterState = document.createElement('span');
    if (message.state === 'passed') {
      tooltipTesterState.classList.add('highlight-success');
    } else if (message.state === 'failed') {
      tooltipTesterState.classList.add('highlight-error');
    } else if (message.state === 'skipped') {
      tooltipTesterState.classList.add('highlight-warning');
    } else {
      tooltipTesterState.classList.add('highlight-info');
    }
    const tooltip = document.createElement('span');
    tooltip.appendChild(tooltipTesterName);
    tooltip.appendChild(tooltipTesterState);
    tooltip.appendChild(tooltipDuration);
    tooltip.classList.add('inline-block', 'tester-tooltip-title');
    const item = document.createElement('span');
    item.classList.add('block', 'tester-gutter', 'tester-highlight', `${message.state}`);
    // https://atom.io/docs/api/v1.14.4/TooltipManager#instance-add
    atom.tooltips.add(item, {
      title: tooltip.innerHTML,
      placement: 'right',
      delay: { show: 100, hide: 100 },
    });
    const marker = editor.getBuffer()
        .markRange([[message.lineNumber, 0], [message.lineNumber, 0]], { invalidate: 'inside' });
    gutter.decorateMarker(marker, {
      class: 'tester-row',
      item,
    });
  });
}
