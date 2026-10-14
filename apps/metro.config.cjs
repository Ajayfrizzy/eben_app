/* global __dirname */
const path = require("node:path");
const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Official artwork is shared from the repository root, outside the Expo project.
config.watchFolders = [
  ...new Set([...config.watchFolders, path.resolve(__dirname, "../assets")]),
];
module.exports = config;
