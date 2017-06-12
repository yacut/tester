'use babel';

/* @flow*/
import { TextEditor } from 'atom';
import ResultView from '../../lib/views/ResultView';
// import { messages } from '../common';
import { state, messages } from '../common';

// TODO add spec for 'testProject' button
describe('ResultView', () => {
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

    const passedMessage = Object.assign({}, messages[0]);
    passedMessage.state = 'passed';
    newState = Object.assign({}, state);
    newState.messages = [passedMessage];
    newState.rawMessages = [passedMessage];
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 0');
    expect(view.refs.passed.textContent).toBe('Passed: 1');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[0].textContent).toBe('passed');

    const skippedMessage = Object.assign({}, messages[0]);
    skippedMessage.state = 'skipped';
    newState = Object.assign({}, state);
    newState.messages = [skippedMessage];
    newState.rawMessages = [skippedMessage];
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 0');
    expect(view.refs.skipped.textContent).toBe('Skipped: 1');
    expect(view.refs.passed.textContent).toBe('Passed: 0');
    expect(view.refs.emptyContainer.style.display).toBe('none');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(1);
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row .tester-message-state')[0].textContent).toBe('skipped');

    newState = Object.assign({}, state);
    const failedTest = messages[0];
    newState.messages = [passedMessage, skippedMessage, failedTest];
    newState.rawMessages = [passedMessage, skippedMessage, failedTest];
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('Failed: 1');
    expect(view.refs.skipped.textContent).toBe('Skipped: 1');
    expect(view.refs.passed.textContent).toBe('Passed: 1');
    expect(view.refs.messagesContainer.querySelectorAll('.tester-message-row').length).toBe(3);
  });
});
