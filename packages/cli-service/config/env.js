const { get } = require("lodash");

module.exports = {
  CI_BUILD_NUMBER: get(process.env, "CI_BUILD_NUMBER", 0),
  GIT_BRANCH: get(process, "GIT_BRANCH", 0),
  GIT_COMMIT_SHORT: get(process, "GIT_COMMIT_SHORT", 0),
  ENABLE_ANALYZER: get(process.env, "ENABLE_ANALYZER", 0),
  ENABLE_SOURCEMAP: get(process.env, "ENABLE_SOURCEMAP", 0),
};
