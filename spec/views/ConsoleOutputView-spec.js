'use babel';

/* @flow*/
import ConsoleOutputView, { defaultContent } from '../../lib/views/ConsoleOutputView';
import { state } from '../common';

describe('ConsoleOutputView', () => {
  it('should not throw new constructor', () => {
    expect(() => new ConsoleOutputView({ state })).not.toThrow();
  });

  it('should set output text', () => {
    const initState = Object.assign({}, state);
    initState.output = 'some text';
    const view = new ConsoleOutputView({ state: initState });
    expect(view.element.className).toBe('tester-view');
    expect(view.refs.output.textContent).toBe('some text');
  });

  it('should set default text', () => {
    const view = new ConsoleOutputView({ state });
    expect(view.refs.output.innerHTML).toBe(defaultContent);
  });

  it('should update output text', async () => {
    const view = new ConsoleOutputView({ state });
    const newState = Object.assign({}, state);
    newState.output = 'another text';
    await view.update(newState);
    expect(view.refs.output.textContent).toBe('another text');
  });
});
