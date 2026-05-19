const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const {resolve: metroResolve} = require('metro-resolver');

const defaultConfig = getDefaultConfig(__dirname);
const {assetExts, sourceExts} = defaultConfig.resolver;

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * Los `.svg` se transforman con `react-native-svg-transformer` para poder usarlos como componentes.
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  transformer: {
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  },
  resolver: {
    assetExts: assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg'],
    resolveRequest: (context, moduleName, platform) => {
      if (moduleName === 'node:buffer') {
        return {
          type: 'sourceFile',
          filePath: require.resolve('buffer/index.js'),
        };
      }
      return metroResolve(
        {...context, resolveRequest: metroResolve},
        moduleName,
        platform,
      );
    },
  },
};

module.exports = mergeConfig(defaultConfig, config);
