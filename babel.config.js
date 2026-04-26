// Babel config — minimal Expo preset, no extra plugins required.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
