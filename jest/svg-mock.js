'use strict';

const React = require('react');
const {View} = require('react-native');

function SvgMock(props) {
  return React.createElement(View, props);
}

module.exports = SvgMock;
module.exports.__esModule = true;
module.exports.default = SvgMock;
