/* @flow */

import { Disposable } from 'atom';
import { it } from 'jasmine-fix';
import * as Helpers from '../lib/helpers';

describe('Helpers', () => {
  describe('subscriptiveObserve', () => {
    it('activates synchronously', () => {
      let activated = false;
      Helpers.subscriptiveObserve({
        observe(eventName, callback) {
          activated = true;
          expect(eventName).toBe('someEvent');
          expect(typeof callback).toBe('function');
        },
      }, 'someEvent', () => { });
      expect(activated).toBe(true);
    });
    it('clears last subscription when value changes', () => {
      let disposed = 0;
      let activated = false;
      Helpers.subscriptiveObserve({
        observe(eventName, callback) {
          activated = true;
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(1);
          callback();
          expect(disposed).toBe(2);
        },
      }, 'someEvent', () => new Disposable(() => {
        disposed += 1;
      }));
      expect(activated).toBe(true);
    });
    it('clears both subscriptions at the end', () => {
      let disposed = 0;
      let observeDisposed = 0;
      let activated = false;
      const subscription = Helpers.subscriptiveObserve({
        observe(eventName, callback) {
          activated = true;
          expect(disposed).toBe(0);
          callback();
          expect(disposed).toBe(0);
          return new Disposable(() => {
            observeDisposed += 1;
          });
        },
      }, 'someEvent', () => new Disposable(() => {
        disposed += 1;
      }));
      expect(activated).toBe(true);
      subscription.dispose();
      expect(disposed).toBe(1);
      expect(observeDisposed).toBe(1);
    });
  });
});
