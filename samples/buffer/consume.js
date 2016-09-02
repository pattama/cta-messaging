'use strict';

const messaging = require('../../lib')({}, {
  name: 'messaging',
  properties: {
    provider: 'rabbitmq',
  },
  singleton: false,
});

let consumed = [];

function cb(json) {
  consumed = consumed.concat(json.messages.map((e) => {
    return e.index;
  })).sort();
  console.log(consumed.join(', '));
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
