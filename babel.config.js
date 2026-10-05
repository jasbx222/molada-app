module.exports = function (api) {
  api.cache(true);
  // babel-preset-expo already adds the react-native-worklets plugin when it is installed.
  return {
    presets: ['babel-preset-expo'],
  };
};
