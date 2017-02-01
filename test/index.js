'use strict';

const amqp = require('amqplib');

describe('RabbitMQ Gitlab CI Docker tests', function() {
  it('rabbitmq connection', function(done){
    amqp.connect('amqp://localhost?heartbeat=60')
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
