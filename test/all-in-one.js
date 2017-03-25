const assert = require('assert');

describe('Some mocha tests', () => {
  it('should compare strings', () => {
    assert.equal('stringA', 'stringB');
  });

  it.skip('should skip test', () => {
    console.info('no console log on skipped test');
  });

  it('should compare dates', () => {
    assert.equal(new Date(), new Date('01-01-2016'));
  });

  it('should compare arrays', () => {
    assert.equal(['1', '2'], ['3', '2']);
  });

  it('should compare two objects', () => {
    const foo = { foo: 1 };
    const bar = { bar: 2 };
    assert.equal(foo, bar);
  });

  it('should compare booleans', () => {
    assert.equal(true, false);
  });

  describe('Some second level describe', () => {
    it('should delay test and pass', (done) => {
      assert.ok(true, true);
      setTimeout(done, 500);
    });
  });
});
