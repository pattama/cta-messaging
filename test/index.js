'use strict';

const amqp = require('amqplib');
const config = require('./config');

describe('RabbitMQ Gitlab CI Docker tests', function() {
  it('rabbitmq connection', function(done){
    this.timeout(5000);
    console.log(`trying connection to host '${config.rabbitMqUrl}'`);
    amqp.connect(config.rabbitMqUrl)
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      });
  });
});
