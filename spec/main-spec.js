'use babel';

import main from '../lib/main';
import { sampleTester } from './common';
import { addTesterAction } from '../lib/redux/actions';

describe('Main', () => {
  describe('When creating a new Tester', () => {
    it('should not throw', () => {
      expect(() => main.initialize()).not.toThrow();
    });
    it('should have all properties and methods wenn initialize', () => {
      expect(main.consumeStatusBar).toBeTruthy();
      expect(main.initialize).toBeTruthy();
      expect(main.getInstance).toBeTruthy();
      expect(main.consumeTester).toBeTruthy();
      expect(main.serialize).toBeTruthy();
      expect(main.deactivate).toBeTruthy();

      main.initialize();
      const tester = main.getInstance() || {};
      expect(tester).toBeTruthy();
      expect(tester.commands).toBeTruthy();
      expect(tester.subscriptions).toBeTruthy();
      expect(tester.createStatusBar).toBeTruthy();
      expect(tester.toggleConsoleView).toBeTruthy();
      expect(tester.toggleResultView).toBeTruthy();
      expect(tester.getStore).toBeTruthy();
      expect(tester.deserializeConsoleOutput).toBeTruthy();
      expect(tester.deserializeResultView).toBeTruthy();
      expect(tester.dispose).toBeTruthy();
    });
  });

  describe('When using methods', () => {
    it('should call createStatusBar', () => {
      main.initialize();
      const instance = main.getInstance();
      spyOn(instance, 'createStatusBar');
      const statusBar = 'statusBarObject';
      main.consumeStatusBar(statusBar);
      expect(instance.createStatusBar).toHaveBeenCalledWith(statusBar);
    });

    it('should dispatch action wenn add tester', () => {
      main.initialize();
      const instance = main.getInstance();
      const store = { dispatch: () => {} };
      spyOn(store, 'dispatch');
      spyOn(instance, 'getStore').andCallFake(() => store);
      main.consumeTester(sampleTester);
      expect(store.dispatch).toHaveBeenCalledWith(addTesterAction(sampleTester));
    });

    it('should not dispatch an action wenn tester is bad', () => {
      main.initialize();
      const instance = main.getInstance();
      const store = { dispatch: () => {} };
      spyOn(store, 'dispatch');
      spyOn(instance, 'getStore').andCallFake(() => store);
      spyOn(atom.notifications, 'addError');
      main.consumeTester({});
      expect(atom.notifications.addError).toHaveBeenCalled();
      expect(store.dispatch).not.toHaveBeenCalled();
    });

    it('should return state wenn serialize', () => {
      main.initialize();
      const instance = main.getInstance();
      const state = {
        editor: 'should be removed',
        testers: ['should clear array'],
        testRunning: true,
        rest: 'rest',
      };
      const store = { getState: () => state };
      spyOn(store, 'getState').andCallThrough();
      spyOn(instance, 'getStore').andCallFake(() => store);
      const actualState = main.serialize();
      expect(instance.getStore).toHaveBeenCalled();
      expect(store.getState).toHaveBeenCalled();
      expect(actualState).toEqual({
        testers: [],
        testRunning: false,
        rest: 'rest',
      });
    });

    it('should call dispose wenn deactivate', () => {
      main.initialize();
      const instance = main.getInstance();
      spyOn(instance, 'dispose');
      main.deactivate();
      expect(instance.dispose).toHaveBeenCalled();
    });
  });
});
