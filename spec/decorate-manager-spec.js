'use babel';

/* @flow*/
import { TextBuffer, TextEditor } from 'atom';
import { failedTest, sleep } from './common';
import { clearInlineMessages, clearDecoratedGutter, decorateGutter, setInlineMessages } from '../lib/decorate-manager';

describe('Decorate Manager', () => {
  let textEditor;
  let messages;
  beforeEach(async () => {
    messages = [Object.assign(failedTest)];
    const buffer = new TextBuffer({ text: 'some text' });
    textEditor = new TextEditor({ buffer, largeFileMode: true });
    textEditor.addGutter({ name: 'tester' });
    delete messages[0].filePath;
  });

  describe('setInlineMessages', () => {
    it('should not throw if calls with empty editor', () => {
      expect(() => setInlineMessages(null, [])).not.toThrow();
    });
    it('should not throw if calls with empty messages', () => {
      expect(() => setInlineMessages(textEditor, [])).not.toThrow();
    });
    it('should add the inline mesage if messages are not empty', () => {
      setInlineMessages(textEditor, messages);
      expect(textEditor.testerMarkers).toBeTruthy();
      expect(textEditor.testerMarkers.length).toBe(1);
    });
  });

  describe('clearInlineMessages', () => {
    it('should not throw if calls with empty editor', () => {
      expect(() => clearInlineMessages(null)).not.toThrow();
    });
    it('should not throw if calls with empty messages', () => {
      expect(() => clearInlineMessages(textEditor)).not.toThrow();
    });
    it('should clear the inline mesages', () => {
      setInlineMessages(textEditor, messages);
      clearInlineMessages(textEditor);
      expect(textEditor.testerMarkers.length).toBe(0);
    });
  });

  describe('decorateGutter', () => {
    it('should not throw if calls with empty editor', () => {
      expect(() => decorateGutter(null, null, [])).not.toThrow();
    });
    it('should not throw if calls with empty gutter', () => {
      expect(() => decorateGutter(textEditor, null, [])).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
    it('should not throw if calls with empty gutter', () => {
      expect(textEditor.gutterWithName('tester')).toBeTruthy();
      expect(() => decorateGutter(textEditor, textEditor.gutterWithName('tester'), [])).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
      expect(() => clearDecoratedGutter(textEditor, textEditor.gutterWithName('tester'))).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
    it('should clear the inline mesages', async () => {
      expect(textEditor.gutterWithName('tester')).toBeTruthy();
      decorateGutter(textEditor, textEditor.gutterWithName('tester'), messages);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(1);
      await sleep(1);
      clearDecoratedGutter(textEditor, textEditor.gutterWithName('tester'));
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
  });
});
