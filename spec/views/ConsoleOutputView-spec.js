'use babel';

/* @flow*/
import ConsoleOutputView from '../../lib/views/ConsoleOutputView';

describe('<ConsoleOutputView />', () => {
  it('should not throw new constructor', () => {
    expect(() => new ConsoleOutputView({})).not.toThrow();
  });

  it('should set output text', () => {
    const view = new ConsoleOutputView({ output: 'some text' });
    expect(view.element.className).toBe('tester-view');
    expect(view.element.querySelector('.output').textContent).toBe('some text');
  });

  it('should update output text', async () => {
    const view = new ConsoleOutputView({ output: 'some text' });
    await view.update({ output: 'another text' });
    expect(view.element.querySelector('.output').textContent).toBe('another text');
  });
});
