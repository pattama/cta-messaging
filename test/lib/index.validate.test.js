'use strict';

const o = require('../common');
const io = o.lib();
const validations = require('./index.validate.testdata.js');

describe('validate params', function() {
  Object.keys(validations).forEach(function(method) {
    const tests = validations[method];
    tests.forEach(function(test) {
      it(test.message, function(done) {
        io[method](test.params)
          .then(function() {
            // console.log('data: ', data);
            done('should be rejected!');
          }, function() {
            // console.error('successful expected error: ', err);
            done();
          });
      });
    });
  });
});

