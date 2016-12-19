'use strict';

const o = require('../common');
describe('produce/consume in queues', function() {
  it('consume with ack set to resolve', function(done) {
    return o.co(function* coroutine() {
      const provider = o.lib();
      yield provider.init();
      const _ack = o.sinon.stub(provider.consumersChannel, 'ack');
      const queue = o.shortid.generate();
      const json = {
        id: '01',
        timestamp: Date.now(),
      };
      const spy = o.sinon.spy();
      yield provider.consume({
        queue: queue,
        cb: spy,
        ack: 'resolve',
      });
      yield provider.produce({
        queue: queue,
        json: json,
      });
      setTimeout(function() {
        o.sinon.assert.calledOnce(spy);
        o.sinon.assert.calledWith(spy, json);
        _ack.restore();
        o.sinon.assert.calledOnce(_ack);
        done();
      }, 100);
    })
    .catch((err) => {
      done(err);
    });
  });

  it('consume with ack set to auto', function(done) {
    return o.co(function* coroutine() {
      const provider = o.lib();
      yield provider.init();
      const _ack = o.sinon.stub(provider.consumersChannel, 'ack');
      const queue = o.shortid.generate();
      const json = {
        id: '01',
        timestamp: Date.now(),
      };
      const cb = function(doc) {
        return new Promise((resolve) => {
          setTimeout(function() {
            resolve(doc);
          }, 100);
        });
      };
      const _cb = o.sinon.spy(cb);
      yield provider.consume({
        queue: queue,
        cb: _cb,
        ack: 'auto',
      });
      yield provider.produce({
        queue: queue,
        json: json,
      });
      setTimeout(function() {
        _ack.restore();
        o.sinon.assert.notCalled(_ack);
        o.sinon.assert.calledOnce(_cb);
        o.sinon.assert.calledWith(_cb, json);
        done();
      }, 300);
    })
    .catch((err) => {
      done(err);
    });
  });
});
