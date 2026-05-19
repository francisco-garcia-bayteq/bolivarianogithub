'use strict';

const fs = require('fs');
const path = require('path');

const configPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-view-shot',
  'react-native.config.js',
);

/**
 * react-native-view-shot 5.0.0-alpha.3 ships a react-native.config.js that
 * uses the `project` key instead of `dependency`, which prevents the RN CLI
 * from auto-linking the native module. Removing the file lets the CLI
 * auto-detect the Android and iOS native code from the directory structure.
 *
 * Remove this script once a stable v5 ships with the fix.
 */
function main() {
  if (!fs.existsSync(configPath)) {
    return;
  }

  const content = fs.readFileSync(configPath, 'utf8');
  if (content.includes('"project"') || content.includes("'project'") || /\bproject\s*:/.test(content)) {
    fs.unlinkSync(configPath);
    console.log(
      '[postinstall] fix-view-shot-autolink: removed broken react-native.config.js',
    );
  }
}

main();
