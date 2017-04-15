'use babel';

/* @flow */

import Path from 'path';
import Commands from '../lib/commands';

let commands;

describe('Tester Commands', () => {
  beforeEach(() => {
    if (commands) {
      commands.dispose();
    }
    commands = new Commands();
  });

  it('properly notifies its listeners of command execution', async () => {
    let testCalled = 0;
    let toggleOutputCalled = 0;

    commands.onShouldTest(() => (testCalled += 1));
    commands.onShouldToggleTesterOutput(() => (toggleOutputCalled += 1));

    await atom.workspace.open(Path.join(__dirname, 'fixtures', 'test.txt'));
    const textEditor = atom.views.getView(atom.workspace.getActiveTextEditor());
    expect(testCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    atom.commands.dispatch(textEditor, 'tester:test');
    expect(testCalled).toBe(1);
    expect(toggleOutputCalled).toBe(0);
    atom.commands.dispatch(textEditor, 'tester:toggle-tester-output');
    expect(testCalled).toBe(1);
    expect(toggleOutputCalled).toBe(1);
  });
});
