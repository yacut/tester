'use babel';

/* @flow */

import Path from 'path';
import Commands from '../lib/commands';
import { asyncTest } from './common';

let commands;

describe('Tester Commands', () => {
  beforeEach(() => {
    if (commands) {
      commands.dispose();
    }
    commands = new Commands();
  });

  it('should properly notifies its listeners of command execution', asyncTest(async (done) => {
    let testCalled = 0;
    let testProjectCalled = 0;
    let toggleOutputCalled = 0;
    let toggleResultsCalled = 0;

    commands.onShouldTest(() => (testCalled += 1));
    commands.onShouldTestProject(() => (testProjectCalled += 1));
    commands.onShouldToggleTesterOutput(() => (toggleOutputCalled += 1));
    commands.onShouldToggleTesterResultView(() => (toggleResultsCalled += 1));

    await atom.workspace.open(Path.join(__dirname, 'fixtures', 'test.txt'));
    const textEditor = atom.views.getView(atom.workspace.getActiveTextEditor());
    const workspaceElement = atom.views.getView(atom.workspace);

    expect(testCalled).toBe(0);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(textEditor, 'tester:test');
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:test-project');
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(1);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:toggle-tester-output');
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(1);
    expect(toggleOutputCalled).toBe(1);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:toggle-tester-result');
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(1);
    expect(toggleOutputCalled).toBe(1);
    expect(toggleResultsCalled).toBe(1);
    done();
  }));
});
