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

// npm nested `react-native-css-interop` under nativewind's own node_modules
// (to satisfy a peer-dependency constraint) instead of hoisting it to
// <root>/node_modules. `disableHierarchicalLookup` above means Metro won't
// walk up from there to find it, so point Metro at it directly.
// Same story for `semver`: react-native-reanimated's version-check script
// needs semver v7's modular `semver/functions/*` subpath API, but the
// workspace root has an old top-level semver@6 (some other tool's
// dependency) that predates that layout, and reanimated's own compatible
// copy is nested in its node_modules — again invisible to Metro with
// disableHierarchicalLookup on.
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'react-native-css-interop': path.resolve(
    workspaceRoot,
    'node_modules/nativewind/node_modules/react-native-css-interop'
  ),
  semver: path.resolve(workspaceRoot, 'node_modules/react-native-reanimated/node_modules/semver'),
};

module.exports = withNativeWind(config, { input: './global.css' });
