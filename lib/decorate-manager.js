'use babel';

// @flow
import type { TextEditor } from 'atom';
import { normalizeString } from './helpers';
import type { Gutter, Message } from './types';

export function setInlineMessages(editor: TextEditor, messages: Array<Message>, shouldAnsiToHtml: boolean, inlineErrorPosition: string) {
  if (!editor) {
    return;
  }
  messages.forEach((message) => {
    const content = normalizeString(message, shouldAnsiToHtml);
    if (!content) {
      return;
    }
    const rowRange = editor.getBuffer().rangeForRow(message.lineNumber);
    const marker = editor.markBufferRange(
        rowRange,
        { invalidate: 'never' },
      );

    const inlineMessage = document.createElement('div');
    inlineMessage.classList.add('inline-block', 'tester-inline-message');
    inlineMessage.innerHTML = content;
    inlineMessage.onclick = () => inlineMessage.classList.toggle('full-size');

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

export function clearInlineMessages(editor: TextEditor) {
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
    editor.testerMarkers = [];
  }
}

export function decorateGutter(editor: ?TextEditor, gutter: ?Gutter, messages: Array<Object>) {
  if (!editor || !gutter) {
    return;
  }
  messages.forEach((message) => {
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
    atom.tooltips.add(item, {
      title: tooltip.innerHTML,
      placement: 'right',
      delay: { show: 100, hide: 100 },
    });
    if (editor && gutter) {
      const marker = editor.getBuffer()
        .markRange([[message.lineNumber, 0], [message.lineNumber, 0]], { invalidate: 'inside' });
      gutter.decorateMarker(marker, {
        class: 'tester-row',
        item,
      });
    }
  });
}
