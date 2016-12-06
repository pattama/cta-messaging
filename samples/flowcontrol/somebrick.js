'use strict';

const Brick = require('cta-brick');

class Somebrick extends Brick {
  constructor(cementHelper, config) {
    super(cementHelper, config);
  }
}

module.exports = Somebrick;
