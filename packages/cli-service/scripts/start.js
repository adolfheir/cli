// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

const webpack = require("webpack");
const WebpackDevServer = require("webpack-dev-server");
const { openBrowser } = require("@houqi/cli-utils");
const configFactory = require("../config/webpack.config");

const webpackConfig = configFactory("development");
// const webpackConfig = configFactory;

// create compiler
const compiler = webpack(webpackConfig);

// create server
const PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const devServer = new WebpackDevServer(
  {
    client: {
      overlay: false,
      progress: true,
      logging: "none",
    },
    // watchFiles: ["src/**/*", "public/**/*"],
    compress: true,
    hot: true,
    historyApiFallback: true,
    host: HOST,
    port: PORT,
  },
  compiler
);

// start

devServer.startCallback((err) => {
  if (err) {
    return console.log(err);
  }
  openBrowser(`http://${HOST.replace(/0.0.0.0/g, "127.0.0.1")}:${PORT}`);
});
