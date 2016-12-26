'use strict';

const co = require('co');
co(function * () {
  const messaging = require('../../lib')();
  const produceResp = yield messaging.produce({
    queue: 'cta-info-sample',
    content: {
      data: new Date().toISOString(),
    },
  });
  console.log('produceResp: ', produceResp);

  const infoResp = yield messaging.info('cta-info-sample-0');
  console.log('infoResp: ', infoResp);
}).catch((err) => {
  console.error('Error: ', err);
});
