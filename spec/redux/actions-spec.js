'use babel';

import * as actions from '../../lib/redux/actions';

describe('Actions', () => {
  describe('creating an action', () => {
    it('should set right action type', () => {
      expect(actions.addTesterAction().type).toBe(actions.ADD_TESTER);
      expect(actions.clearAction().type).toBe(actions.CLEAR);
      expect(actions.errorAction().type).toBe(actions.ERROR);
      expect(actions.goToNextTestAction().type).toBe(actions.GO_TO_NEXT_TEST);
      expect(actions.goToPreviousTestAction().type).toBe(actions.GO_TO_PREVIOUS_TEST);
      expect(actions.setCurrentMessageAction().type).toBe(actions.SET_CURRENT_MESSAGE);
      expect(actions.finishTestAction().type).toBe(actions.FINISH_TEST);
      expect(actions.removeTesterAction().type).toBe(actions.REMOVE_TESTER);
      expect(actions.setAdditionalArgsAction().type).toBe(actions.SET_ADDITIONAL_ARGS);
      expect(actions.setEditorAction().type).toBe(actions.SET_EDITOR);
      expect(actions.setFilterAction().type).toBe(actions.SET_FILTER);
      expect(actions.setSortByAction().type).toBe(actions.SET_SORTBY);
      expect(actions.startTestAction().type).toBe(actions.START_TEST);
      expect(actions.stopTestAction().type).toBe(actions.STOP_TEST);
      expect(actions.testAction().type).toBe(actions.TEST);
      expect(actions.testLastAction().type).toBe(actions.TEST_LAST);
      expect(actions.testProjectAction().type).toBe(actions.TEST_PROJECT);
      expect(actions.transformMessagesAction().type).toBe(actions.TRANSFORM_MESSAGES);
      expect(actions.updateEditorAction().type).toBe(actions.UPDATE_EDITOR);
      expect(actions.updateMessagesAction().type).toBe(actions.UPDATE_MESSAGES);
      expect(actions.updateOutputAction().type).toBe(actions.UPDATE_OUTPUT);
    });
  });
});
