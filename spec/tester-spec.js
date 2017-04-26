'use babel';

/* @flow*/
import tester from '../lib/tester';

describe('Tester', () => {
  it('shoud have all properties and methods', () => {
    expect(tester).toBeTruthy();
    expect(tester.instance).toBe(null);
    expect(tester.activate).toBeTruthy();
    expect(tester.deactivate).toBeTruthy();
    expect(tester.consumeStatusBar).toBeTruthy();
    expect(tester.consumeTester).toBeTruthy();
  });
});
