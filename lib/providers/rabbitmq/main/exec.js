'use strict';

const tools = require('cta-common');
const co = require('co');

/**
 * Execute a main method
 * first validate main method params,
 * then check RabbitMQ connection,
 * then execute the method
 * ensure to return a same pattern
 * @param input - object of parameters
 * @param input.params - main method parameters
 * @param input.pattern - main method parameters pattern for validation
 * @param input.cb - main method to execute
 * @param {object} that - reference to main class
 * @returns {Promise}
 * @private
 */
module.exports = {
  key: '_exec',
  fn: (input, that) => {
    return new Promise((resolve, reject) => {
      co(function*() {
        const vp = tools.validate(input.params, input.pattern, {throwErr: true}).output;
        yield that.init();
        const result = yield input.cb(vp);
        resolve({result: result, params: vp});
      }).catch((err) => {
        that.logger.error(err);
        reject(err);
      });
    });
  },
};
