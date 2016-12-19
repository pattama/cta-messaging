'use strict';

const messaging = require('../../lib')();
function cb(json, dependencies) {
  return new Promise((resolve) => {
    dependencies.logger.info('Called subscriber callback');
    setTimeout(function() {
      resolve(json);
    }, 2000);
  });
}
messaging.subscribe({
  topic: 'cta-subscribe-sample',
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
