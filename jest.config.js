module.exports = {
  preset: 'react-native',
  setupFiles: [
    require.resolve('react-native/jest/setup.js'),
    '<rootDir>/jest.setup.js',
  ],
  // collectCoverageFrom: [
  //   'src/**/*.{ts,tsx}',
  //   '!src/**/*.d.ts',
  //   /** Barrels de re-export: no aportan lógica y arrastran el % global en Sonar/Jest. */
  //   '!src/**/index.ts',
  // ],
  moduleNameMapper: {
    '^react-native-quick-crypto$': '<rootDir>/jest/crypto-shim.js',
    '^react-native-screenguard$': '<rootDir>/jest/screenguard-mock.js',
    '^react-native-view-shot$': '<rootDir>/jest/view-shot-mock.js',
    '\\.svg$': '<rootDir>/jest/svg-mock.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation/.*|react-native-quick-crypto|react-native-nitro-modules|react-native-quick-base64|uuid|react-native-linear-gradient|react-native-view-shot)/)',
  ],
};
