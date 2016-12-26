'use strict';

const messaging = require('../../lib')();

function fn() {
  const content = {
    id: Date.now(),
    content: new Date().toISOString(),
  };
  messaging.publish({
    content: content,
  }).then(function(response) {
    console.log('response: ', response);
  }, function(err) {
    console.error('error: ', err);
  });
}

setInterval(fn, 2000);
