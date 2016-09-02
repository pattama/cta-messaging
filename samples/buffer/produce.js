'use strict';
const messaging = require('../../lib')({}, {
  name: 'messaging',
  properties: {
    provider: 'rabbitmq',
    parameters: {
      flushThreshold: 5,
      flushInterval: 120000,
    },
  },
  singleton: false,
});

messaging.init().then(() => {
  let i = 0;
  const interval = setInterval(() => {
    if (i === 20) {
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
  }, 1);
});



