'use babel';

import reducer from '../../lib/redux/reducers';

describe('Reducers', () => {
  describe('creating reducer', () => {
    it('should set default state and return it', () => {
      const defaultState = {
        rawMessages: [],
        currentFileOnly: false,
        currentMessage: null,
        messages: [],
        output: '',
        testRunning: false,
        editor: null,
        isProjectTest: false,
        sorter: { key: '', desc: false },
        testers: [],
        additionalArgs: '',
      };
      expect(reducer(undefined, { type: 'unknown' })).toEqual(defaultState);
    });
  });
});
