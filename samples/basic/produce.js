'use strict';

const messaging = require('cta-messaging')();
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
