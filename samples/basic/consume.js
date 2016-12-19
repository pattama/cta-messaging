'use strict';

const messaging = require('../../lib')();
function cb(json, dependencies) {
  return new Promise((resolve) => {
    dependencies.logger.info('Called consumer callback');
    setTimeout(function() {
      resolve(json);
    }, 2000);
  });
}
messaging.consume({
  queue: 'cta-produce-sample',
  cb: cb,
  ack: 'resolve',
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
