["module", "openBrowser"].forEach((m) => {
  Object.assign(exports, require(`./lib/${m}`));
});

exports.spawn = require("cross-spawn");
exports.chalk = require("chalk");
exports.execa = require("execa");
exports.semver = require("semver");
