/* @flow */

import TesterRegistry from '../lib/tester-registry';
import { getEditorTester, getTester, getFixturesPath } from './common';

describe('TesterRegistry', () => {
  let testerRegistry;

  beforeEach(async () => {
    atom.packages.loadPackage('tester');
    atom.packages.loadPackage('language-javascript');
    testerRegistry = new TesterRegistry();
    await atom.packages.activatePackage('language-javascript');
    await atom.workspace.open(__filename);
  });
  afterEach(() => {
    testerRegistry.dispose();
    atom.workspace.destroyActivePane();
  });

  describe('::test', () => {
    it('tests the editor even if its not the active one', async () => {
      try {
        await atom.workspace.open(getFixturesPath('file.txt'));
        const editor = atom.workspace.getActiveTextEditor();
        await atom.workspace.open(__filename);
        expect(await testerRegistry.test(getEditorTester(editor))).toBe(true);
      } finally {
        atom.workspace.destroyActivePane();
      }
    });

    it('emits events properly', async () => {
      let timesBegan = 0;
      let timesUpdated = 0;
      let timesFinished = 0;

      testerRegistry.onDidBeginTesting(() => {
        timesBegan += 1;
      });
      testerRegistry.onDidFinishTesting(() => {
        timesFinished += 1;
      });
      testerRegistry.onDidUpdateMessages(() => {
        timesUpdated += 1;
      });

      const tester = getTester();
      testerRegistry.addTester(tester);
      const promise = testerRegistry.test(null, true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(0);
      expect(await promise).toBe(true);
      expect(timesUpdated).toBe(1);
      expect(timesFinished).toBe(1);
    });
    it('triggers the finish event even when the provider crashes', async () => {
      let timesBegan = 0;
      let timesUpdated = 0;
      let timesFinished = 0;

      testerRegistry.onDidBeginTesting(() => {
        timesBegan += 1;
      });
      testerRegistry.onDidFinishTesting(() => {
        timesFinished += 1;
      });
      testerRegistry.onDidUpdateMessages(() => {
        timesUpdated += 1;
      });

      const tester = getTester();
      testerRegistry.addTester(tester);
      tester.test = function test() { throw new Error('Boom'); };
      const promise = testerRegistry.test(null, true);
      expect(timesBegan).toBe(1);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(0);
      expect(await promise).toBe(true);
      expect(timesUpdated).toBe(0);
      expect(timesFinished).toBe(1);
    });
  });
});
