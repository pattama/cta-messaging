'use strict';

const o = require('../common');
const global = {
  queue1: o.shortid.generate(),
  queue2: o.shortid.generate(),
  key1: o.shortid.generate(),
  key2: o.shortid.generate(),
};

describe('functional: index / get', function() {
  Object.keys(o.providers).forEach(function(provider) {
    context(provider + ' provider', function() {
      const io = o.lib(provider);
      it('produce first message in queue1', function(done) {
        const json = o.json();
        io.produce({
          queue: global.queue1,
          json: json,
        }).then(function(response) {
          o.assert.property(response, 'result');
          global.produced1 = json;
          done();
        }).catch(function(err) {
          done(err);
        });
      });

      it('produce second message in queue1', function(done) {
        const json = o.json();
        io.produce({
          queue: global.queue1,
          json: json,
        }).then(function(response) {
          o.assert.property(response, 'result');
          global.produced2 = json;
          done();
        }).catch(function(err) {
          done(err);
        });
      });

      it('queue1 should have 2 messages count', function(done) {
        io.info(global.queue1).then(function(response) {
          o.assert.property(response, 'result');
          o.assert.propertyVal(response.result, 'messageCount', 2);
          done();
        }).catch(function(err) {
          done(err);
        });
      });

      it('get first message in queue1 with promise callback', function(done) {
        io.get({
          queue: global.queue1,
        }).then(function(response) {
          o.assert.property(response, 'result');
          o.assert.deepEqual(response.result.json, global.produced1);
          done();
        }).catch(function(err) {
          done(err);
        });
      });

      it('get second message in queue1 with non promise callback', function(done) {
        io.get({
          queue: global.queue1,
        }).then(function(response) {
          o.assert.property(response, 'result');
          o.assert.deepEqual(response.result.json, global.produced2);
          done();
        }).catch(function(err) {
          done(err);
        });
      });

      it('queue1 should have 0 messages count', function(done) {
        io.info(global.queue1).then(function(response) {
          o.assert.property(response, 'result');
          o.assert.propertyVal(response.result, 'messageCount', 0);
          done();
        }).catch(function(err) {
          done(err);
        });
      });
    });
  });
});
