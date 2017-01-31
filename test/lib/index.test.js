'use strict';

const o = require('../common');

describe('Messaging Tool Class Wrapper', () => {
  it('should call main class with default params', () => {
    const m = o.lib();
    o.assert.instanceOf(m, o.rmq);
    o.assert.strictEqual(m.configuration.properties.provider, 'rabbitmq');
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
    o.assert.strictEqual(m.configuration.properties.c, 2);
    o.assert.property(m.dependencies, 'a');
  });
});
