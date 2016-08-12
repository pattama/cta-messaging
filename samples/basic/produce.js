'use strict';

const messaging = require('../../lib')();
messaging.produce({
  queue: 'cta-produce-sample',
  json: {
    job: 'run command',
    cmd: 'ls',
  },
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
