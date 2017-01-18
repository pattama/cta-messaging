'use strict';
const sinon = require('sinon');
require('sinon-as-promised');
const shortid = require('shortid');
const path = require('path');
const os = require('os');
const providers = require('../lib/providers');
const lib = require('../lib');

module.exports = {
  fs: require('fs'),
  path: require('path'),
  os: require('os'),
  mkdirp: require('mkdirp'),
  rmdir: require('rmdir'),
  amqp: require('amqplib'),
  assert: require('chai').assert,
  expect: require('chai').expect,
  sinon: sinon,
  shortid: shortid,
  tool: require('cta-tool'),
  co: require('co'),
  sleep: require('co-sleep'),
  lib: lib,
  providers: providers,
  rmq: require('../lib/providers/rabbitmq'),
  buffers: {
    Memory: require('../lib/providers/rabbitmq/buffers/memory'),
    File: require('../lib/providers/rabbitmq/buffers/file'),
  },
  json: function() {
    return {
      id: shortid.generate(),
      date: new Date().toISOString(),
    };
  },
  queue: () => { return shortid.generate(); },
  topic: () => { return shortid.generate(); },
  location: () => { return path.join(os.tmpDir(), shortid.generate()); },
  mq: () => {
    return new lib({}, {
      singleton: false,
    });
  },
};
