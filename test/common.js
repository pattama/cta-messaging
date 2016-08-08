'use strict';

const shortid = require('shortid');

module.exports = {
  amqp: require('amqplib/callback_api'),
  assert: require('chai').assert,
  expect: require('chai').expect,
  sinon: require('sinon'),
  shortid: shortid,
  tool: require('cta-tool'),
  co: require('co'),
  sleep: require('co-sleep'),
  lib: require('../lib'),
  messaging: require('../lib/messaging.js'),
  fn: require('../lib/fn.js'),
  providers: require('../lib/providers'),
  rmq: require('../lib/providers/rabbitmq'),
  json: function() {
    return {
      id: shortid.generate(),
      date: new Date().toISOString(),
    };
  },
};
