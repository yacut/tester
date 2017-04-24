'use babel';

/* @flow*/
import StatusBar from '../../lib/views/StatusBar';
import { messages } from '../common';

describe('StatusBar', () => {
  it('should not throw new constructor', () => {
    expect(() => new StatusBar({})).not.toThrow();
  });

  it('should set counters to zero if no messages', () => {
    const view = new StatusBar({ messages: [], runningTestersCount: 0 });
    expect(view.element.className).toBe('status-bar-tester inline-block');
    expect(view.refs.failed.textContent).toBe('0');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.tiny.className).toContain('idle');
  });

  it('should update tiny if test running and counters if some message', async () => {
    const view = new StatusBar({ messages: [], runningTestersCount: 0 });
    expect(view.element.className).toBe('status-bar-tester inline-block');
    expect(view.refs.failed.textContent).toBe('0');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.tiny.className).toContain('idle');
    await view.update({ runningTestersCount: 1 });
    expect(view.refs.failed.textContent).toBe('0');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.tiny.className).not.toContain('idle');
    await view.update({ messages });
    expect(view.refs.failed.textContent).toBe('1');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.tiny.className).not.toContain('idle');
    await view.update({ runningTestersCount: 0 });
    expect(view.refs.failed.textContent).toBe('1');
    expect(view.refs.skipped.textContent).toBe('0');
    expect(view.refs.passed.textContent).toBe('0');
    expect(view.refs.tiny.className).toContain('idle');
  });
});
