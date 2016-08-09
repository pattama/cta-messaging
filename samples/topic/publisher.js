'use strict';

const messaging = require('cta-messaging')();

function fn() {
  const json = {
    id: Date.now(),
    content: new Date().toISOString(),
  };
  messaging.publish({
    json: json,
  }).then(function(response) {
    console.log('response: ', response);
  }, function(err) {
    console.error('error: ', err);
  });
}

setInterval(fn, 2000);
