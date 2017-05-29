'use babel';

/* @flow*/
import ConsoleOutputView, { defaultContent } from '../../lib/views/ConsoleOutputView';

describe('ConsoleOutputView', () => {
  it('should not throw new constructor', () => {
    expect(() => new ConsoleOutputView({})).not.toThrow();
  });

  it('should set output text', () => {
    const view = new ConsoleOutputView({ output: 'some text' });
    expect(view.element.className).toBe('tester-view');
    expect(view.refs.output.textContent).toBe('some text');
  });

  it('should set default text', () => {
    const view = new ConsoleOutputView({});
    expect(view.refs.output.innerHTML).toBe(defaultContent);
  });
  //
  // it('should update output text', async () => {
  //   const view = new ConsoleOutputView({ output: 'some text' });
  //   await view.update({ output: 'another text' });
  //   expect(view.refs.output.textContent).toBe('another text');
  // });
});
