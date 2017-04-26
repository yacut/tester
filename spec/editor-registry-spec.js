/* @flow */

import EditorRegistry from '../lib/editor-registry';
import { sleep } from './common';

describe('EditorRegistry', () => {
  let editorRegistry;

  beforeEach(() => {
    atom.workspace.open(__filename);
    editorRegistry = new EditorRegistry();
  });

  afterEach(async () => {
    atom.workspace.destroyActivePane();
    editorRegistry.editorTesters.clear();
    editorRegistry.dispose();
    await sleep(0);
  });

  describe('When creating a new EditorRegistry', () => {
    it('should not throw', () => {
      expect(() => new EditorRegistry()).not.toThrow();
    });
  });

  describe('When activating and creating from a TextEditor', () => {
    it('should add current open editors to registry', () => {
      expect(editorRegistry.editorTesters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorTesters.size).toBe(1);
    });

    it('should add editors as they are opened', async () => {
      expect(editorRegistry.editorTesters.size).toBe(0);
      editorRegistry.activate();
      await sleep(0);
      expect(editorRegistry.editorTesters.size).toBe(1);
      await atom.workspace.open();
      await sleep(0);
      expect(editorRegistry.editorTesters.size).toBe(2);
    });

    it('should remove the editor as it is closed', async () => {
      expect(editorRegistry.editorTesters.size).toBe(0);
      editorRegistry.activate();
      await sleep(0);
      expect(editorRegistry.editorTesters.size).toBe(1);
      await atom.workspace.open();
      await sleep(0);
      expect(editorRegistry.editorTesters.size).toBe(2);
      atom.workspace.destroyActivePaneItem();
      expect(editorRegistry.editorTesters.size).toBe(1);
      atom.workspace.destroyActivePane();
      expect(editorRegistry.editorTesters.size).toBe(0);
    });

    it('should not test instantly if testOnOpen setting is off', async () => {
      editorRegistry.activate();
      atom.config.set('tester.testOnOpen', false);
      let testCalls = 0;
      editorRegistry.observe((editorTester) => {
        spyOn(editorTester, 'test').andCallFake(() => (testCalls += 1));
      });
      expect(testCalls).toBe(0);
      await atom.workspace.open();
      await sleep(0);
      expect(testCalls).toBe(0);
    });

    it('should trigger test instantly if testOnOpen is on', async () => {
      editorRegistry.activate();

      atom.config.set('tester.testOnOpen', true);
      let testCalls = 0;
      editorRegistry.observe((editorTester) => {
        spyOn(editorTester, 'test').andCallFake(() => (testCalls += 1));
      });
      expect(testCalls).toBe(0);
      await atom.workspace.open();
      await sleep(0);
      expect(testCalls).toBe(3);
    });
  });

  describe('When observe event is called', () => {
    it('should call with current editors and updates as new are opened', async () => {
      let timesCalled = 0;
      editorRegistry.observe(() => {
        timesCalled += 1;
      });
      expect(timesCalled).toBe(0);
      editorRegistry.activate();
      await sleep(0);
      expect(timesCalled).toBe(1);
      await atom.workspace.open();
      await sleep(0);
      expect(timesCalled).toBe(2);
    });
  });

  describe('When dispose event is called', () => {
    it('should dispose all the editors on dispose', async () => {
      let timesDisposed = 0;
      editorRegistry.observe((editorTester) => {
        editorTester.onDidDestroy(() => {
          timesDisposed += 1;
        });
      });
      expect(timesDisposed).toBe(0);
      editorRegistry.activate();
      await sleep(0);
      expect(timesDisposed).toBe(0);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(1);
      await atom.workspace.open();
      await sleep(0);
      expect(timesDisposed).toBe(1);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(2);
      await atom.workspace.open();
      await atom.workspace.open();
      await sleep(0);
      editorRegistry.dispose();
      expect(timesDisposed).toBe(4);
    });
  });
});
