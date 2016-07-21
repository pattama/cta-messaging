# CTA Messaging Module
----------------------

## How to use it

require it like this

````javascript
const Messaging = require('cta-messaging');
````

Then you can choose a provider

## Providers

### RabbitMQ provider

````javascript
const Messaging = require('cta-messaging');
const messaging = new Messaging('rabbitmq', {url: 'amqp://my.mq.host'});
````

This provider uses amqplib node module

Refer to https://www.rabbitmq.com/ to get a working rabbitMQ environment.

### Other providers

We have currently only one provider RabbitMQ. We will manage to provide more providers in the future:

* Kafka provider
* Http provider

## Main methods

### Produce

This method produces a message in a queue for consumers to consume from.

````javascript
const messaging = require('cta-messaging')();
messaging.produce({
  queue: 'cta-produce-sample',
  json: {
    job: 'run command',
    cmd: 'ls',
  },
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
````

See samples/basic/produce.js

### Consume

This method registers a consumer to listen to a queue and consume messages as soon as they are produced.

A consumer will proceed with the next message in the queue only when the first message has been acknowledged.

````javascript
const messaging = require('cta-messaging')();
function cb(json) {
  return new Promise((resolve) => {
    // adding timeout to simulate job running
    setTimeout(function() {
      resolve(json);
    }, 500);
  });
}
messaging.consume({
  queue: 'cta-produce-sample',
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
````

See samples/basic/consume.js

### Subscribe

This method registers a subscriber to listen to a queue in an exchange and consume messages as soon as they are produced.

Unlike a consumer, a subscriber will proceed with all messages in the queue.

````javascript
'use strict';
const messaging = require('cta-messaging')();
function cb(json) {
  return new Promise((resolve) => {
    resolve(json);
  });
}
messaging.subscribe({
  queue: 'cta-subscribe-sample',
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
````

See samples/basic/subscribe.js

### Publish

This method publishes a message in an exchange for subscribers to consume from.

````javascript
'use strict';
const messaging = require('cta-messaging')();
const json = {
  id: '123',
  status: 'ok',
  description: 'simple test',
};
messaging.publish({
  queue: 'cta-subscribe-sample',
  json: json,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
````

see samples/basic/publish.js