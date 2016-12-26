'use strict';

const messaging = require('../../lib')();
messaging.produce({
  queue: 'cta-produce-sample',
  content: {
    data: new Date().toISOString(),
  },
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
