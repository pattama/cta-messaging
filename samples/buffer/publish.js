'use strict';
const messaging = require('../../lib')({}, {
  name: 'messaging',
  properties: {
    provider: 'rabbitmq',
    parameters: {
      flushThreshold: 500,
      flushInterval: 1000,
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
    messaging.publish({
      topic: 'buffer_sample',
      json: {
        index: i,
      },
      buffer: 'memory',
    }).then((response) => {
      console.log('response: ', response);
    }, (err) => {
      console.error('error: ', err);
    });
  }, 400);
});



