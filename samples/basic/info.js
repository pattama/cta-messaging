'use strict';

const messaging = require('cta-messaging')();
messaging.info('test')
.then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
