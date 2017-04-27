'use babel';

/* @flow*/
import Tester from '../lib/main';

describe('Main', () => {
  describe('When creating a new Tester', () => {
    it('should not throw', () => {
      expect(() => new Tester()).not.toThrow();
    });
    it('shoud have all properties and methods', () => {
      const tester = new Tester();
      expect(tester).toBeTruthy();
      expect(tester.commands).toBeTruthy();
      expect(tester.registryEditors).toBeTruthy();
      expect(tester.registryTesters).toBeTruthy();
      expect(tester.subscriptions).toBeTruthy();
      expect(tester.markers).toEqual([]);
      expect(tester.runningTestersCount).toBe(0);
      expect(tester.messages).toEqual([]);
      expect(tester.output).toBe('Nothing new to show');

      expect(tester.createStatusBar).toBeTruthy();
      expect(tester.updateStatusBar).toBeTruthy();
      expect(tester.togglePanel).toBeTruthy();
      expect(tester.toggleResultView).toBeTruthy();
      expect(tester.dispose).toBeTruthy();
    });
  });
});
