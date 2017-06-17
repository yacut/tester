'use babel';

/* @flow*/
import { TextBuffer, TextEditor } from 'atom';
import { asyncTest, failedTest } from './common';
import { clearInlineMessages, clearDecoratedGutter, decorateGutter, setInlineMessages } from '../lib/decorate-manager';

describe('Decorate Manager', () => {
  let textEditor;
  let messages;
  beforeEach(async () => {
    messages = [Object.assign(failedTest)];
    const buffer = new TextBuffer({ text: 'some text' });
    buffer.setPath(messages[0].filePath);
    textEditor = new TextEditor({ buffer, largeFileMode: true });
    textEditor.addGutter({ name: 'tester' });
  });

  describe('setInlineMessages', () => {
    it('should not throw if calls with empty editor', () => {
      expect(() => setInlineMessages(null, [])).not.toThrow();
    });
    it('should not throw if calls with empty messages', () => {
      expect(() => setInlineMessages(textEditor, [])).not.toThrow();
    });
    it('should add the inline message if messages are not empty', () => {
      atom.config.set('tester.showInlineError', true);
      setInlineMessages(textEditor, messages);
      expect(textEditor.testerMarkers).toBeTruthy();
      expect(textEditor.testerMarkers.length).toBe(1);
    });
    it('should not set a inline message if setting is disabled', () => {
      atom.config.set('tester.showInlineError', false);
      setInlineMessages(textEditor, messages);
      expect(textEditor.testerMarkers).not.toBeTruthy();
    });
  });

  describe('clearInlineMessages', () => {
    it('should not throw if calls with empty editor', () => {
      expect(async () => { await clearInlineMessages(null); }).not.toThrow();
    });
    it('should not throw if calls with empty messages', () => {
      expect(async () => { await clearInlineMessages(textEditor); }).not.toThrow();
    });
    it('should clear the inline mesages', asyncTest(async (done) => {
      atom.config.set('tester.showInlineError', true);
      await setInlineMessages(textEditor, messages);
      await clearInlineMessages(textEditor);
      expect(textEditor.testerMarkers.length).toBe(0);
      done();
    }));
  });

  describe('decorateGutter', () => {
    it('should not throw if calls with empty editor', () => {
      expect(() => decorateGutter(null, [])).not.toThrow();
    });
    it('should not throw if calls with empty gutter', () => {
      expect(() => decorateGutter(textEditor, [])).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
    it('should not throw if calls with empty gutter', () => {
      expect(textEditor.gutterWithName('tester')).toBeTruthy();
      expect(() => decorateGutter(textEditor, [])).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
      expect(() => clearDecoratedGutter(textEditor)).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
    it('should clear the inline mesages', asyncTest(async (done) => {
      atom.config.set('tester.gutterEnabled', true);
      expect(textEditor.gutterWithName('tester')).toBeTruthy();
      await decorateGutter(textEditor, messages);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(1);

      await clearDecoratedGutter(textEditor);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
      done();
    }));
  });
});
