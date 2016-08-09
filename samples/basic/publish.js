'use strict';

const messaging = require('cta-messaging')();
const json = {
  id: '123',
  status: 'ok',
  description: 'simple test',
};
messaging.publish({
  topic: 'cta-subscribe-sample',
  json: json,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
