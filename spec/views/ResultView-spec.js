'use babel';

/* @flow*/
import { TextEditor } from 'atom';
import ResultView from '../../lib/views/ResultView';
import { messages } from '../common';

// TODO add spec for 'testProject' button
describe('ResultView', () => {
  it('should not throw new constructor', () => {
    expect(() => new ResultView({})).not.toThrow();
  });

  it('should set counters to zero if no messages', () => {
    const view = new ResultView({ messages: [], runningTestersCount: 0 });
    expect(view.element.className).toBe('tester-view');
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.additionalArgs instanceof TextEditor).toBe(true);
    expect(view.refs.emptyContainer.style.display).not.toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(0);
  });

  it('should update elements', async () => {
    const view = new ResultView({ messages: [], runningTestersCount: 0, softWrap: false });
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).not.toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(0);

    await view.update({ runningTestersCount: 1 });
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).not.toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(0);

    await view.update({ messages });
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);

    await view.update({ runningTestersCount: 0 });
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row')[0].style.whiteSpace).toBe('nowrap');

    await view.update({ softWrap: true });
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(true);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row')[0].style.whiteSpace).toBe('');

    const passedMessage = Object.assign({}, messages[0]);
    passedMessage.state = 'passed';
    const skippedMessage = Object.assign({}, messages[0]);
    skippedMessage.state = 'skipped';
    await view.update({ messages: [skippedMessage, passedMessage] });
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 1');
    expect(view.refs.passed.textContent).toBe('Passed: 1');
    expect(view.refs.softWrap.checked).toBe(true);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(2);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[0].textContent).toBe('skipped');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[1].textContent).toBe('passed');


    await view.handleSortByClick('state');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[0].textContent).toBe('passed');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[1].textContent).toBe('skipped');

    view.goToNextTest();
    expect(view.currentTest).toEqual(passedMessage);
    view.goToNextTest();
    expect(view.currentTest).toEqual(skippedMessage);
    view.goToNextTest();
    expect(view.currentTest).toEqual(skippedMessage);
    view.goToPreviousTest();
    expect(view.currentTest).toEqual(passedMessage);
    view.goToPreviousTest();
    expect(view.currentTest).toEqual(passedMessage);
  });
});
