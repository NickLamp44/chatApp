const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.blacklistRE = /react-native-maps\/lib\/.*/;

module.exports = defaultConfig;
