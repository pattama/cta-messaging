'use strict';

const o = require('../../../common');

describe('http provider', () => {
  context('when instantiated', () => {
    const http = new o.http({}, {
      name: 'http',
      properties: {
        url: 'http://localhost:3100',
      },
    });
    it('should have express dependency', () => {
      o.assert.property(http, 'express');
    });
    it('should set api post /message', (done) => {
      o.request({
        method: 'POST',
        uri: `http://localhost:${http.config.port}/message`,
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
      o.assert.isOk(http.fullyInitialized);
    });
  });
});
