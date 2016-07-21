'use strict';

const messaging = require('cta-messaging')();
function cb(json) {
  return new Promise((resolve) => {
    // adding timeout to simulate job running
    setTimeout(function() {
      resolve(json);
    }, 500);
  });
}
messaging.consume({
  queue: 'cta-produce-sample',
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
