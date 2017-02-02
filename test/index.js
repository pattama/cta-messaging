'use strict';

const amqp = require('amqplib');
const config = require('./config');

describe('RabbitMQ Gitlab CI Docker tests', function() {
  it('rabbitmq connection', function(done){
    amqp.connect(config.rabbitMqUrl)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
