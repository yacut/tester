'use babel';

// @flow
import type { TextEditor } from 'atom';
import { Observable } from 'rxjs';
import { normalizeString } from './helpers';
import type { Message } from './types';

export function setInlineMessages(editor: TextEditor, messages: Array<Message>): Promise<any> {
  if (!atom.config.get('tester.showInlineError')) {
    return Promise.resolve();
  }
  if (!editor || !messages) {
    return Promise.resolve();
  }
  const currentFilePath = editor.getPath();
  return Observable.from(messages)
    .filter((message: Message) => currentFilePath === message.filePath)
    .do((message) => {
      const content = normalizeString(message);
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

      const inlineErrorPosition = atom.config.get('tester.inlineErrorPosition');
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
    })
    .toPromise();
}

export function clearInlineMessages(editor: TextEditor): Promise<any> {
  if (!editor || !editor.testerMarkers) {
    return Promise.resolve();
  }
  return Observable.from(editor.testerMarkers)
    .filter(marker => !marker.isDestroyed())
    .do((marker) => {
      marker.destroy();
    })
    .finally(() => {
      editor.testerMarkers = [];
    })
    .toPromise();
}

export function clearDecoratedGutter(editor: ?TextEditor): Promise<any> {
  if (!editor) {
    return Promise.resolve();
  }

  return Observable.from(editor.getDecorations({ gutterName: 'tester', type: 'gutter' }))
    .filter(decoration => !decoration.isDestroyed())
    .do((decoration) => {
      decoration.getMarker().destroy();
      decoration.destroy();
    })
    .toPromise();
}

export function decorateGutter(editor: ?TextEditor, messages: Array<Message>): Promise<any> {
  if (!atom.config.get('tester.gutterEnabled')) {
    return Promise.resolve();
  }
  if (!editor || !messages) {
    return Promise.resolve();
  }
  const gutter = editor.gutterWithName('tester');
  if (!gutter) {
    return Promise.resolve();
  }
  const currentFilePath = editor.getPath();
  return Observable.from(messages)
    .filter((message: Message) => currentFilePath === message.filePath)
    .do((message: Message) => {
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
    })
    .toPromise();
}
