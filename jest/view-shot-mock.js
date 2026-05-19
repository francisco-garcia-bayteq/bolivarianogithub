/**
 * Stub para Jest: react-native-view-shot publica ESM/JSX en lib/ y Jest no lo transforma
 * si no está en transformIgnorePatterns; el mapper evita cargar node_modules por completo.
 */
const React = require('react');
const {View} = require('react-native');

module.exports = {
  __esModule: true,
  default: React.forwardRef((props, ref) => {
    const {children, options: _options, ...rest} = props;
    React.useImperativeHandle(ref, () => ({
      capture: jest.fn(() => Promise.resolve('file://mock-view-shot.png')),
    }));
    return React.createElement(View, rest, children);
  }),
};
