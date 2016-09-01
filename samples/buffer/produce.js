'use strict';

const messaging = require('../../lib')();
const shortid = require('shortid');
const queue = shortid.generate();
messaging._init().then(() => {
  for (let i = 1; i < 20; i++) {
    messaging.produce({
      queue: queue,
      json: {
        index: i,
      },
      buffer: true,
    }).then((response) => {
      console.log('response: ', response);
    }, (err) => {
      console.error('error: ', err);
    });
  }
});


let i = 0;
setInterval(() => {
  if (i > 50) {
    return;
  }
  i++;
  messaging.produce({
    queue: queue,
    json: {
      index: i,
    },
    buffer: true,
  }).then((response) => {
    console.log('response: ', response);
  }, (err) => {
    console.error('error: ', err);
  });
}, 100);
