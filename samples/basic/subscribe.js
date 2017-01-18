'use strict';

const messaging = require('../../lib')();
function cb(content, dependencies) {
  return new Promise((resolve) => {
    setTimeout(function() {
      dependencies.logger.info('Ending subscriber callback');
      resolve(content);
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
