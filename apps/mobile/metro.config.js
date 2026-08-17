const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// This is an npm workspaces monorepo, so most deps (including `expo` itself)
// are hoisted to <root>/node_modules. Without the settings below, Metro can
// resolve `expo/AppEntry.js` from an inconsistent location, and that file's
// own `import '../../App'` — a literal filesystem-relative path, computed
// from wherever the `expo` package physically sits on disk — ends up
// pointing at <root>/App.js instead of apps/mobile/App.js, which is exactly
// the "Unable to resolve ../../App from node_modules/expo/AppEntry.js"
// error. This is Expo's own documented fix for npm/yarn workspace monorepos.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

module.exports = withNativeWind(config, { input: './global.css' });
