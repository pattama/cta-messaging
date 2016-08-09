'use strict';

const messaging = require('cta-messaging')();
function cb(json) {
  console.log(json);
}
messaging.subscribe({
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});