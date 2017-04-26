'use babel';

/* @flow*/
import Tester from '../lib/main';

describe('Main', () => {
  describe('When creating a new Tester', () => {
    it('shoud not throw', () => {
      expect(() => new Tester()).not.toThrow();
    });
  });
});
