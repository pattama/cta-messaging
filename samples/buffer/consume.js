'use strict';

const messaging = require('../../lib')({}, {
  name: 'messaging',
  properties: {
    provider: 'rabbitmq',
  },
  singleton: false,
});

const arr = [];
for (let i = 1; i <= 2000; i++) {
  arr.push(i);
}
const ref = arr.join(', ');

let consumed = [];

function cb(content) {
  consumed = consumed.concat(content.messages.map((e) => {
    return e.index;
  }));
  consumed.sort((a, b) => {
    return a - b;
  });
  const res = consumed.join(', ');
  console.log(res, ref.indexOf(res) === 0);
}
messaging.consume({
  queue: 'buffer_sample',
  cb: cb,
  ack: 'auto',
}).then(function(response) {
  console.log(response);
}, function(err) {
  console.error('error: ', err);
});
