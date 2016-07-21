'use strict';

const o = require('../../../../common');

describe('unit: rabbitmq provider singleton', function() {
  it('should return a new instance', function() {
    const one = o.rmq({newInstance: true});
    one.time = Date.now();
    const two = o.rmq({newInstance: true});
    o.assert(!two.time);
  });

  it('should return a same instance', function() {
    const three = o.rmq();
    const id = o.shortid.generate();
    const time = Date.now();
    three[id] = time;
    const four = o.rmq();
    o.assert.property(four, id);
    o.assert.strictEqual(four[id], time);
  });
});
