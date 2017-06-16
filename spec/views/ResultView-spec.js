'use babel';

/* @flow*/
import { TextEditor } from 'atom';
import ResultView from '../../lib/views/ResultView';
import { state, failedTest, passedTest, skippedTest } from '../common';

// TODO add spec for 'testProject' button
describe('ResultView', () => {
  const messages = [failedTest];
  it('should not throw new constructor', () => {
    expect(() => new ResultView({ state })).not.toThrow();
  });

  it('should set counters to zero if no messages', () => {
    const view = new ResultView({ state });
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
    let newState;
    const view = new ResultView({ state });
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).not.toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(0);

    newState = Object.assign({}, state);
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).not.toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(0);

    newState = Object.assign({}, state);
    newState.testRunning = true;
    newState.messages = messages;
    newState.rawMessages = messages;
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);

    newState = Object.assign({}, state);
    newState.testRunning = false;
    newState.messages = messages;
    newState.rawMessages = messages;
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.softWrap.checked).toBe(false);
    expect(view.refs.testProject.className).not.toContain('tester-wait-button');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row')[0].style.whiteSpace).toBe('nowrap');

    newState = Object.assign({}, state);
    newState.messages = [passedTest];
    newState.rawMessages = [passedTest];
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 1');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[0].textContent).toBe('passed');

    newState = Object.assign({}, state);
    newState.messages = [skippedTest];
    newState.rawMessages = [skippedTest];
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 1');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[0].textContent).toBe('skipped');

    newState = Object.assign({}, state);
    newState.messages = [passedTest, skippedTest, failedTest];
    newState.rawMessages = [passedTest, skippedTest, failedTest];
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 1');
    expect(view.refs.passed.textContent).toBe('Passed: 1');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(3);
  });
});
