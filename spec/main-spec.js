'use babel';

/* @flow*/
import main from '../lib/main';

describe('Main', () => {
  describe('When creating a new Tester', () => {
    it('should not throw', () => {
      expect(() => main.initialize()).not.toThrow();
    });
    it('shoud have all properties and methods', () => {
      main.initialize();
      const tester = main.getInstance() || {};
      expect(tester).toBeTruthy();
      expect(tester.commands).toBeTruthy();
      expect(tester.subscriptions).toBeTruthy();

      expect(tester.createStatusBar).toBeTruthy();
      expect(tester.toggleConsoleView).toBeTruthy();
      expect(tester.toggleResultView).toBeTruthy();
      expect(tester.dispose).toBeTruthy();
    });
  });
});
