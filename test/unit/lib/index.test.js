'use strict';

const o = require('../../common');

describe('unit: Io Module Constructor', function() {
  it('reject if no provider passed', function() {
    try {
      const io = o.lib();
    } catch (e) {
      o.assert.equal(e.message, 'Missing provider name');
    }
  });
  it('reject if unknown provider', function() {
    try {
      const io = o.lib('abc');
    } catch (e) {
      o.assert.equal(e.message, 'Unknown provider "abc"');
    }
  });
});
