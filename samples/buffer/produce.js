'use strict';
const messaging = require('../../lib')({}, {
  name: 'messaging',
  properties: {
    provider: 'rabbitmq',
    parameters: {
      buffer: {
        flushThreshold: 500,
        flushInterval: 1000,
      },
    },
  },
  singleton: false,
});

messaging.init().then(() => {
  let i = 0;
  const interval = setInterval(() => {
    if (i === 10) {
      clearInterval(interval);
      return;
    }
    i++;
    messaging.produce({
      queue: 'buffer_sample',
      json: {
        index: i,
      },
      buffer: 'file',
    }).then((response) => {
      console.log('response: ', response);
    }, (err) => {
      console.error('error: ', err);
    });
  }, 400);
});



