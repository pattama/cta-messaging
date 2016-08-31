'use strict';

const o = require('../../../common');
const http = new o.http({}, {
  name: 'http',
  properties: {
    url: 'http://localhost:3100',
  },
});
describe('http provider', () => {
  context('when instantiated', () => {
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
  context('main methods', () => {
    const _request = o.sinon.stub(o, 'request', (obj) => {
      console.log(obj);
    });
    ['produce', 'get', 'consume', 'publish', 'subscribe', 'ack', 'nack', 'info', 'cancel'].forEach((method) => {
      it(method, (done) => {
        const params = o.shortid.generate();
        http[method](params)
        .then(() => {
          o.sinon.calledWith(_request, {
            method: 'POST',
            uri: http.config.url,
            body: {
              method: method,
              params: params,
            },
            json: true,
          });
          done();
        }).catch((err) => {
          done(err);
        });
      });
    });
    _request.restore();
  });
});
