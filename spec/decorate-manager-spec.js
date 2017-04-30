'use babel';

/* @flow*/
import { TextBuffer, TextEditor } from 'atom';
import { messages } from './common';
import { clearInlineMessages, decorateGutter, setInlineMessages } from '../lib/decorate-manager';

describe('Decorate Manager', () => {
  let textEditor;
  beforeEach(async () => {
    const buffer = new TextBuffer({ text: 'some text' });
    textEditor = new TextEditor({ buffer, largeFileMode: true });
  });

  describe('setInlineMessages', () => {
    it('should not throw if calls with empty editor', () => {
      expect(() => setInlineMessages(null, [], false, '')).not.toThrow();
    });
    it('should not throw if calls with empty messages', () => {
      expect(() => setInlineMessages(textEditor, [], false, '')).not.toThrow();
    });
    it('should add the inline mesage if messages are not empty', () => {
      setInlineMessages(textEditor, messages, false, '');
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
      setInlineMessages(textEditor, messages, false, '');
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
      expect(() => decorateGutter(textEditor, textEditor.getGutters()[0], [])).not.toThrow();
      expect(textEditor.getBuffer().getMarkerCount()).toBe(0);
    });
    it('should clear the inline mesages', () => {
      decorateGutter(textEditor, textEditor.getGutters()[0], messages);
      expect(textEditor.getBuffer().getMarkerCount()).toBe(1);
    });
  });
});
