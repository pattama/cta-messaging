'use strict';

module.exports = {
  produce: [
    {
      message: 'reject produce with missing param queue',
      params: {
        json: {},
      },
    },
    {
      message: 'reject produce with missing param json',
      params: {
        queue: 'test',
      },
    },
    {
      message: 'reject produce with wrong param type json',
      params: {
        queue: 'test',
        json: 'abc',
      },
    },
    {
      message: 'reject produce with wrong param type queue',
      params: {
        queue: {},
        json: {},
      },
    },
  ],
  consume: [
    {
      message: 'reject consume with missing param queue',
      params: {
        cb: function() {},
      },
    },
    {
      message: 'reject consume with missing param cb',
      params: {
        queue: 'test',
      },
    },
    {
      message: 'reject consume with wrong param type queue',
      params: {
        queue: {},
        cb: function() {},
      },
    },
    {
      message: 'reject consume with wrong param type cb',
      params: {
        queue: 'test',
        cb: 123,
      },
    },
  ],
  subscribe: [
    {
      message: 'reject subscribe with missing param cb',
      params: {},
    },
    {
      message: 'reject subscribe with wrong param type cb',
      params: {
        cb: 'abc',
      },
    },
  ],
  publish: [
    {
      message: 'reject publish with missing param json',
      params: {},
    },
    {
      message: 'reject publish with wrong param type json',
      params: {
        json: 123,
      },
    },
  ],

};