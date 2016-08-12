'use strict';

const messaging = require('../../lib')();
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
