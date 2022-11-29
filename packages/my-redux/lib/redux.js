'use strict';

var _includesInstanceProperty = require('@babel/runtime-corejs3/core-js-stable/instance/includes');

var test = function test() {
  var _context;
  console.log("test");
  _includesInstanceProperty(_context = [1]).call(_context, 1);
};
test();

exports.test = test;
