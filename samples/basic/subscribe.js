'use strict';

const messaging = require('../../lib')();
function cb(json) {
  return new Promise((resolve) => {
    resolve(json);
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
