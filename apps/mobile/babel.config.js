module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // react-native-reanimated v4 moved its babel plugin from
    // 'react-native-reanimated/plugin' to 'react-native-worklets/plugin' —
    // must be listed last per both packages' docs.
    plugins: ['react-native-worklets-core/plugin', 'react-native-worklets/plugin'],
  };
};
