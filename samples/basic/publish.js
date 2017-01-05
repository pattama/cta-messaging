'use strict';

const messaging = require('../../lib')();
const content = {
  id: '123',
  status: 'ok',
  description: 'simple test',
};
messaging.publish({
  topic: 'cta-subscribe-sample',
  content: content,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
