const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  ...config.resolver.alias,
  "react-native-keyboard-controller": require.resolve(
    "./keyboard-controller-web-shim.js"
  ),
};

config.resolver.platforms = ["web", "ios", "android", "native"];

module.exports = config;
