// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

const webpack = require("webpack");
const configFactory = require("../config/webpack.config");

const webpackConfig = configFactory("production");

// create compiler
const compiler = webpack(webpackConfig);

console.log("Creating an optimized production build...");
compiler.run((err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }
  //使用FriendlyErrorsWebpackPlugin 处理

  // const info = stats.toJson();

  // if (stats.hasErrors()) {
    // console.error(info.errors);
  // }

  // if (stats.hasWarnings()) {
  //   console.warn(info.warnings);
  // }

  //  console.log("stats",stats)
});
