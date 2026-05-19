/**
 * Jest maps `react-native-quick-crypto` to Node's `crypto` for unit tests.
 */
const crypto = require('crypto');
const {Buffer} = require('buffer');

module.exports = Object.assign(crypto, {
  Buffer,
  default: crypto,
});
