const { get } = require("lodash");

module.exports = {
  VERSION: get(process.env, "VERSION", 0),
  ENABLE_ANALYZER: get(process.env, "ENABLE_ANALYZER", 0),
  ENABLE_SOURCEMAP: get(process.env, "ENABLE_SOURCEMAP", 0),
};
