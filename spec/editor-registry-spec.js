/* @flow */

import EditorRegistry from '../lib/editor-registry';
// TODO Fix tests
xdescribe('EditorRegistry', () => {
  let editorRegistry;

  beforeEach(() => {
    atom.workspace.open(__filename);
    editorRegistry = new EditorRegistry();
  });
  afterEach(() => {
    atom.workspace.destroyActivePane();
    editorRegistry.dispose();
  });

  describe('::constructor', () => {
    it('is a saint', () => {
      expect(() => new EditorRegistry()).not.toThrow();
    });
  });

  describe('::activate && ::createFromTextEditor', () => {
    it('adds current open editors to registry', () => {
      expect(editorRegistry.editorTesters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorTesters.size).toBe(1);
    });
    it('adds editors as they are opened', async () => {
      expect(editorRegistry.editorTesters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorTesters.size).toBe(1);
      await atom.workspace.open();
      expect(editorRegistry.editorTesters.size).toBe(2);
    });
    it('removes the editor as it is closed', async () => {
      expect(editorRegistry.editorTesters.size).toBe(0);
      editorRegistry.activate();
      expect(editorRegistry.editorTesters.size).toBe(1);
      await atom.workspace.open();
      expect(editorRegistry.editorTesters.size).toBe(2);
      atom.workspace.destroyActivePaneItem();
      expect(editorRegistry.editorTesters.size).toBe(1);
      atom.workspace.destroyActivePane();
      expect(editorRegistry.editorTesters.size).toBe(0);
    });
    it('does not test instantly if testOnOpen is off', async () => {
      editorRegistry.activate();
      atom.config.set('tester.testOnOpen', false);
      let testCalls = 0;
      editorRegistry.observe((editorTester) => {
        spyOn(editorTester, 'test').andCallFake(() => (testCalls += 1));
      });
      expect(testCalls).toBe(0);
      await atom.workspace.open();
      expect(testCalls).toBe(0);
    });
    it('invokes test instantly if testOnOpen is on', async () => {
      editorRegistry.activate();

      atom.config.set('tester.testOnOpen', true);
      let testCalls = 0;
      editorRegistry.observe((editorTester) => {
        spyOn(editorTester, 'test').andCallFake(() => (testCalls += 1));
      });
      expect(testCalls).toBe(0);
      await atom.workspace.open();
      expect(testCalls).toBe(3);
    });
  });
  describe('::observe', () => {
    it('calls with current editors and updates as new are opened', async () => {
      let timesCalled = 0;
      editorRegistry.observe(() => {
        timesCalled += 1;
      });
      expect(timesCalled).toBe(0);
      editorRegistry.activate();
      expect(timesCalled).toBe(1);
      await atom.workspace.open();
      expect(timesCalled).toBe(2);
    });
  });
  describe('::dispose', () => {
    it('disposes all the editors on dispose', async () => {
      let timesDisposed = 0;
      editorRegistry.observe((editorTester) => {
        editorTester.onDidDestroy(() => {
          timesDisposed += 1;
        });
      });
      expect(timesDisposed).toBe(0);
      editorRegistry.activate();
      expect(timesDisposed).toBe(0);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(1);
      await atom.workspace.open();
      expect(timesDisposed).toBe(1);
      atom.workspace.destroyActivePaneItem();
      expect(timesDisposed).toBe(2);
      await atom.workspace.open();
      await atom.workspace.open();
      editorRegistry.dispose();
      expect(timesDisposed).toBe(4);
    });
  });
});
