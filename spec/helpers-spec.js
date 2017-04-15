/* @flow */

import { Disposable } from 'atom';
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

  describe('convertWindowsPathToUnixPath', () => {
    const originalPlatform = process.platform;
    afterEach(() => {
      Object.defineProperty(process, 'platform', { value: originalPlatform });
    });

    it('should convert windows path', () => {
      Object.defineProperty(process, 'platform', { value: 'win32' });
      expect(Helpers.convertWindowsPathToUnixPath('C:\\path\\to\\file.txt')).toBe('C:/path/to/file.txt');
    });

    it('should not convert unix path', () => {
      Object.defineProperty(process, 'platform', { value: 'linux' });
      expect(Helpers.convertWindowsPathToUnixPath('/path/to/file.txt')).toBe('/path/to/file.txt');
    });
  });

  describe('convertAnsiStringToHtml', () => {
    it('should convert ansi string to html for light theme', () => {
      atom.config.set('tester.ansiToHtml', true);
      spyOn(atom.themes, 'getActiveThemeNames').andCallFake(() => ['light theme']);
      expect(Helpers.convertAnsiStringToHtml('\x1B[49m some dark text with light background \x1B[0m'))
        .toBe('<span style="background-color:#FFF"> some dark text with light background </span>');
    });

    it('should convert ansi string to html for dark theme', () => {
      atom.config.set('tester.ansiToHtml', true);
      spyOn(atom.themes, 'getActiveThemeNames').andCallFake(() => ['dark theme']);
      expect(Helpers.convertAnsiStringToHtml('\x1B[49m some light text with dark background \x1B[0m'))
        .toBe('<span style="background-color:#000"> some light text with dark background </span>');
    });
  });

  describe('escapeHtml', () => {
    it('should escape some html', () => {
      expect(Helpers.escapeHtml('<div>some html</div>'))
        .toBe('&lt;div&gt;some html&lt;&#x2F;div&gt;');
    });
  });
});
