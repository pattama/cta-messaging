'use strict';

const o = require('../common');

describe('Messaging Tool Class Wrapper', () => {
  it('should call main class with default params', () => {
    const m = o.lib();
    o.assert.instanceOf(m, o.rmq);
    o.assert.deepEqual(m.configuration, {
      name: 'cta-messaging',
      properties: {
        provider: 'rabbitmq',
      },
      singleton: true,
    });
  });
  it('should call main class with custom params', () => {
    const dependencies = {
      a: 1,
    };
    const configuration = {
      name: 'b',
      properties: {
        provider: 'rabbitmq',
        c: 2,
      },
    };
    const m = o.lib(dependencies, configuration);
    o.assert.instanceOf(m, o.rmq);
    o.assert.deepEqual(m.configuration, configuration);
    o.assert.deepEqual(m.dependencies, dependencies);
  });
});
