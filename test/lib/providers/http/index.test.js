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
      o.request.post({
        url: `http://localhost:${http.config.port}/message`,
        form: {
          foo: 'bar',
        },
      }, (err, resp, body) => {
        if (err) {
          return done(err);
        }
        console.log(body);
        done();
      });
    });
    it('should set fullyInitialized property', () => {
      o.assert.isOk(http.fullyInitialized);
    });
  });
  context('main methods', () => {
    const _request = o.sinon.stub(o.request, 'post', (obj, fn) => {
      return obj;
    });
    //['produce', 'get', 'consume', 'publish', 'subscribe', 'ack', 'nack', 'info', 'cancel']
    ['produce'].forEach((method) => {
      it(method, (done) => {
        const params = o.shortid.generate();
        http[method](params)
        .then(() => {
          o.sinon.calledWith(_request, {
            url: http.config.url,
            form: {
              method: method,
              params: params,
            },
          });
          done();
        }).catch((err) => {
          o.sinon.calledWith(_request, {
            url: http.config.url,
            form: {
              method: method,
              params: params,
            },
          });
          done();
        });
      });
    });
    _request.restore();
  });
});
