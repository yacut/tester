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
    let clearCalled = 0;
    let goToNextTestCalled = 0;
    let goToPreviousTestCalled = 0;
    let stopCalled = 0;
    let testCalled = 0;
    let testProjectCalled = 0;
    let toggleOutputCalled = 0;
    let toggleResultsCalled = 0;

    commands.onShouldClear(() => (clearCalled += 1));
    commands.onShouldGoToNextTest(() => (goToNextTestCalled += 1));
    commands.onShouldGoToPreviousTest(() => (goToPreviousTestCalled += 1));
    commands.onShouldStop(() => (stopCalled += 1));
    commands.onShouldTest(() => (testCalled += 1));
    commands.onShouldTestProject(() => (testProjectCalled += 1));
    commands.onShouldToggleTesterOutput(() => (toggleOutputCalled += 1));
    commands.onShouldToggleTesterResultView(() => (toggleResultsCalled += 1));

    await atom.workspace.open(Path.join(__dirname, 'fixtures', 'test.txt'));
    const textEditor = atom.views.getView(atom.workspace.getActiveTextEditor());
    const workspaceElement = atom.views.getView(atom.workspace);

    expect(clearCalled).toBe(0);
    expect(goToNextTestCalled).toBe(0);
    expect(goToPreviousTestCalled).toBe(0);
    expect(stopCalled).toBe(0);
    expect(testCalled).toBe(0);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:clear');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(0);
    expect(goToPreviousTestCalled).toBe(0);
    expect(stopCalled).toBe(0);
    expect(testCalled).toBe(0);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:go-to-next-test');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(0);
    expect(stopCalled).toBe(0);
    expect(testCalled).toBe(0);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:go-to-previous-test');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(1);
    expect(stopCalled).toBe(0);
    expect(testCalled).toBe(0);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:stop');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(testCalled).toBe(0);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(textEditor, 'tester:test');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(0);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:test-project');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(1);
    expect(toggleOutputCalled).toBe(0);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:toggle-tester-output');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(1);
    expect(toggleOutputCalled).toBe(1);
    expect(toggleResultsCalled).toBe(0);

    atom.commands.dispatch(workspaceElement, 'tester:toggle-tester-result');
    expect(clearCalled).toBe(1);
    expect(goToNextTestCalled).toBe(1);
    expect(goToPreviousTestCalled).toBe(1);
    expect(stopCalled).toBe(1);
    expect(testCalled).toBe(1);
    expect(testProjectCalled).toBe(1);
    expect(toggleOutputCalled).toBe(1);
    expect(toggleResultsCalled).toBe(1);
    done();
  }));
});
