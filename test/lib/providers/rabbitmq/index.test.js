'use strict';

const o = require('../../../common');

describe('rabbitmq provider', () => {
  context('when instantiated', () => {
    const rmq = new o.rmq({}, {
      name: 'rmq',
      properties: {},
    });
    it('should have express dependency', () => {
      o.assert.property(rmq, 'express');
    });
    it('should set api post /', (done) => {
      o.request({
        method: 'POST',
        uri: `http://localhost:${rmq.config.port}`,
        body: {
          foo: 'bar',
        },
        json: true,
      }).then((data) => {
        console.log(data);
        done();
      }).catch((err) => {
        done(err);
      });
    });
    it('should set fullyInitialized property', () => {
      o.assert.isOk(rmq.fullyInitialized);
    });
  });
});
