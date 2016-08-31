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
  providers: require('../lib/providers'),
  rmq: require('../lib/providers/rabbitmq'),
  http: require('../lib/providers/http'),
  request: require('request-promise-native'),
  json: function() {
    return {
      id: shortid.generate(),
      date: new Date().toISOString(),
    };
  },
};
