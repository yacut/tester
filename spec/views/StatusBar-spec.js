'use babel';

/* @flow*/
import StatusBarTile from '../../lib/views/StatusBarTile';
import { state, messages } from '../common';

describe('StatusBarTile', () => {
  it('should not throw new constructor', () => {
    expect(() => new StatusBarTile({ state, onclick: () => {} })).not.toThrow();
  });

  it('should set counters to zero if no messages', () => {
    const view = new StatusBarTile({ state, onclick: () => {} });
    expect(view.element.className).toBe('status-bar-tester inline-block');
    expect(view.refs.failed.textContent).toBe('0');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.beaker.className).not.toContain('tester-wait-beaker');
  });

  it('should update tiny if test running and counters if some message', async () => {
    let newState;
    const view = new StatusBarTile({ state, onclick: () => {} });
    expect(view.element.className).toBe('status-bar-tester inline-block');
    expect(view.refs.failed.textContent).toBe('0');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.beaker.className).not.toContain('tester-wait-beaker');

    newState = Object.assign({}, state);
    newState.testRunning = true;
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('0');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.beaker.className).toContain('tester-wait-beaker');

    newState = Object.assign({}, state);
    newState.testRunning = true;
    newState.messages = messages;
    newState.rawMessages = messages;
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('1');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.beaker.className).toContain('tester-wait-beaker');

    newState = Object.assign({}, state);
    newState.testRunning = false;
    await view.update(newState);
    expect(view.refs.failed.textContent).toBe('1');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.beaker.className).not.toContain('tester-wait-beaker');
  });
});
