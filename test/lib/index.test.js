'use strict';

const o = require('../common');

describe('Messaging Tool Class Wrapper', function() {
  it('should call class with default params', function() {
    const spy = o.sinon.spy(function() {
      return o.sinon.createStubInstance(o.messaging);
    });
    const m = o.lib();
    o.expect(spy).to.have.been.calledWithNew;
  });
});
