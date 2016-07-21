'use strict';

const shortid = require('shortid');

module.exports = {
  amqp: require('amqplib/callback_api'),
  assert: require('chai').assert,
  sinon: require('sinon'),
  shortid: shortid,
  co: require('co'),
  sleep: require('co-sleep'),
  lib: require('../lib'),
  providers: require('../lib/providers'),
  rmq: require('../lib/providers/rabbitmq'),
  IoBrick: require('../lib'),
  json: function() {
    return {
      id: shortid.generate(),
      date: new Date().toISOString(),
    };
  },
};
