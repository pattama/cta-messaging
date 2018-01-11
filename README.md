# cta-messaging
[![Build Status](https://travis-ci.org/thomsonreuters/cta-messaging.svg?branch=master)](https://travis-ci.org/thomsonreuters/cta-messaging)
[![Coverage Status](https://coveralls.io/repos/github/thomsonreuters/cta-messaging/badge.svg?branch=master)](https://coveralls.io/github/thomsonreuters/cta-messaging?branch=master)
[![codecov](https://codecov.io/gh/thomsonreuters/cta-messaging/branch/master/graph/badge.svg)](https://codecov.io/gh/thomsonreuters/cta-messaging)

Messaging Modules for Compass Test Automation, One of Libraries in CTA-OSS Framework

## General Overview

## Guidelines

We aim to give you brief guidelines here.

1. [Usage](#1-usage)
1. [Configuration](#2-configuration)
1. [Provider](#3-provider)
1. [Methods](#4-methods)

### 1. Usage

```javascript
'use strict';

const Messaging = require('cta-messaging');
const instance = new Messaging();
```

**cta-messaging** module provides a function that can be _initialized an instance_ with **default parameters**.

```javascript
'use strict';

const Messaging = require('cta-messaging');

const dependencies = {...};
const configuration = {...};

const instance = new Messaging(dependencies, configuration);
```
However, we can provide **dependencies** and [**configuration**](#2-configuration) to initialize the instance.

[back to top](#guidelines)

### 2. Configuration

```javascript
'use strict';

const Messaging = require('cta-messaging');

const dependencies = {};
const configuration = {
  name: 'messaging',
  provider: 'rabbitmq',
  parameters: {
    url: 'amqp://my.rmq.host',
  },
};

const instance = new Messaging(dependencies, configuration);
```

In **cta-messaging** module, the **configuration** can be provided with these **_required_** properties:

- **provider**: defines **messaging provider** in a directory path
- **parameters.url**: defines **messaging url**

[back to top](#guidelines)

### 3. Provider

In **cta-messaging** module, we aim to _allow_ developers to use _any messaging module_ as **provider**. However, in v.1.0.0, we use **RabbitMQ**, [rabbitmq.com](https://www.rabbitmq.com/) as **our default provider** with _**default** parameters (localhost)_.

```javascript
'use strict';

const Messaging = require('cta-messaging');
const instance = new Messaging();

// instance is using RabbitMQ by default
```

#### Other Providers

We have currently only **one** provider, **RabbitMQ**. We will manage to provide _more providers in the future_:

- Kafka provider
- Http provider

[back to top](#guidelines)

### 4. Methods

#### Produce Methods

This method produces a message in a queue for consumers to consume from.

```javascript
const Messaging = require('cta-messaging');

const messaging = new Messaging(); 

messaging.produce({
  queue: 'cta-produce-sample',
  content: {
    job: 'run command',
    cmd: 'ls',
  },
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
```

See: _samples/basic/produce.js_

#### Consume Methods

This method registers a consumer to listen to a queue and consume messages as soon as they are produced.

A consumer will proceed with the next message in the queue only when the first message has been acknowledged.

```javascript
const Messaging = require('cta-messaging');

const messaging = new Messaging(); 

function cb(content) {
  return new Promise((resolve) => {
    // adding timeout to simulate job running
    setTimeout(function() {
      resolve(content);
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
```

See: _samples/basic/consume.js_

#### Publish Methods

This method publishes a message in an exchange for subscribers to consume from.

```javascript
const Messaging = require('cta-messaging');

const messaging = new Messaging(); 

function cb(content) {
  return new Promise((resolve) => {
    resolve(content);
  });
}

const content = {
  id: '123',
  status: 'ok',
  description: 'simple test',
};

messaging.publish({
  topic: 'cta-subscribe-sample',
  content: content,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
```

See: _samples/basic/publish.js_

#### Subscribe Methods

This method registers a subscriber to listen to a topic in an exchange and consume messages as soon as they are produced.

Unlike a consumer, a subscriber will proceed with all messages in the queue.

```javascript
const Messaging = require('cta-messaging');

const messaging = new Messaging(); 

function cb(content) {
  return new Promise((resolve) => {
    resolve(content);
  });
}

messaging.subscribe({
  topic: 'cta-subscribe-sample',
  cb: cb,
}).then(function(response) {
  console.log('response: ', response);
}, function(err) {
  console.error('error: ', err);
});
```

See: _samples/basic/subscribe.js_

[back to top](#guidelines)

------

## To Do

* To open for other providers

* To implement other providers
