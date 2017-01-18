'use strict';

const messaging = require('../../lib')();
function cb(content) {
  console.log(content);
}
messaging.subscribe({
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
