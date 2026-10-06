const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.transformer.unstable_workerThreads = false;

module.exports = config;
