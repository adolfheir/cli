const fs = require("fs");
const path = require("path");
const resolve = require("resolve");
const dayjs = require("dayjs");
const webpack = require("webpack");
const dartSass = require("sass");
const WebpackBar = require("webpackbar");
const { isFunction } = require("lodash");
const nodeLibs = require("node-libs-browser");
const { loadModule } = require("@houqi/cli-utils");
const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const { WebpackManifestPlugin } = require("webpack-manifest-plugin");
const getCSSModuleLocalIdent = require("./getCSSModuleLocalIdent");
var FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");

const paths = require("./paths");
const env = require("./env");

module.exports = (webpackEnv) => {
  const isProduction = webpackEnv === "production";

  /* ================ 静态文件loader====================== */
  const imageInlineSizeLimit = 10000;
  const getFileRules = () => {
    return [
      // TODO: Merge this config once `image/avif` is in the mime-db
      // https://github.com/jshttp/mime-db
      {
        test: [/\.avif$/],
        type: "asset",
        mimetype: "image/avif",
        parser: {
          dataUrlCondition: {
            maxSize: imageInlineSizeLimit,
          },
        },
      },
      // "url" loader works like "file" loader except that it embeds assets
      // smaller than specified limit in bytes as data URLs to avoid requests.
      // A missing `test` is equivalent to a match.
      {
        test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
        type: "asset",
        parser: {
          dataUrlCondition: {
            maxSize: imageInlineSizeLimit,
          },
        },
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              prettier: false,
              svgo: false,
              svgoConfig: {
                plugins: [{ removeViewBox: false }],
              },
              titleProp: true,
              ref: true,
            },
          },
          {
            loader: "file-loader",
            options: {
              name: "static/media/[name].[hash].[ext]",
            },
          },
        ],
        issuer: {
          and: [/\.(ts|tsx|js|jsx|md|mdx)$/],
        },
      },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      // This loader doesn't use a "test" so it will catch all modules
      // that fall through the other loaders.
      {
        // Exclude `js` files to keep "css" loader working as it injects
        // its runtime that would otherwise be processed through "file" loader.
        // Also exclude `html` and `json` extensions so they get processed
        // by webpacks internal loaders.
        exclude: [/^$/, /\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
        type: "asset/resource",
      },
    ];
  };
  /* ================ css loader====================== */
  const cssRegex = /\.css$/;
  const cssGlobalRegex = /\.global\.css$/;
  const sassRegex = /\.(scss|sass)$/;
  const sassGlobalRegex = /\.global\.(scss|sass)$/;
  let generateStyleLoaders = (cssOptions, addSass = false) => {
    const loaders = [
      isProduction
        ? {
            loader: MiniCssExtractPlugin.loader,
            // css is located in `static/css`, use '../../' to locate index.html folder
            // in production `paths.publicUrlOrPath` can be a relative path
            options: paths.publicUrlOrPath.startsWith(".")
              ? { publicPath: "../../" }
              : {},
          }
        : require.resolve("style-loader"),
      {
        loader: require.resolve("css-loader"),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve("postcss-loader"),
        options: {
          postcssOptions: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: "postcss",
            plugins: [
              "postcss-flexbugs-fixes",
              [
                "postcss-preset-env",
                {
                  autoprefixer: {
                    flexbox: "no-2009",
                  },
                  stage: 3,
                },
              ],
              // Adds PostCSS Normalize as the reset css with default options,
              // so that it honors browserslist config in package.json
              // which in turn let's users customize the target behavior as per their needs.
              "postcss-normalize",
            ],
          },
          sourceMap: true,
        },
      },
    ].filter(Boolean);
    if (addSass) {
      loaders.push(
        {
          loader: require.resolve("resolve-url-loader"),
          options: {
            sourceMap: true,
            root: paths.appSrc,
          },
        },
        {
          loader: require.resolve("sass-loader"),
          options: {
            sourceMap: true,
            implementation: dartSass,
          },
        }
      );
    }
    return loaders;
  };
  const getCssRules = () => {
    return [
      //css 永远不使用css module
      {
        test: cssRegex,
        use: generateStyleLoaders({
          importLoaders: 1,
          sourceMap: true,
          modules: {
            mode: "icss",
          },
        }),
        sideEffects: true,
      },
      //使用css module & sass
      {
        test: sassRegex,
        // exclude: sassGlobalRegex,
        exclude: /node_modules|\.global\.(scss|sass)$/,
        use: generateStyleLoaders(
          {
            importLoaders: 3,
            sourceMap: true,
            modules: {
              mode: "local",
              getLocalIdent: getCSSModuleLocalIdent,
            },
          },
          "sass-loader"
        ),
      },
      //不使用css module & sass
      {
        test: sassGlobalRegex,
        use: generateStyleLoaders(
          {
            importLoaders: 3,
            sourceMap: true,
            modules: {
              mode: "icss",
            },
          },
          "sass-loader"
        ),
        sideEffects: true,
      },
    ];
  };

  /* ================ js loader====================== */
  const getJsRules = () => {
    return [
      {
        test: /\.(j|t)sx?$/,
        include: paths.appSrc,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
            options: {
              babelrc: false,
              presets: [
                [
                  "@babel/preset-env",
                  // https://github.com/babel/babel/blob/master/packages/babel-preset-env/data/plugins.json#L32
                  {
                    targets: { browsers: ["chrome >= 47"] },
                    useBuiltIns: "usage",
                    corejs: 3,
                  },
                ],
                "@babel/preset-typescript",
                "@babel/preset-react",
              ],
              plugins: [
                ["@babel/plugin-proposal-decorators", { legacy: true }],
                ["@babel/plugin-proposal-class-properties", { loose: true }],
                ["@babel/plugin-proposal-private-methods", { loose: true }],
                [
                  "@babel/plugin-proposal-private-property-in-object",
                  { loose: true },
                ],
                "@babel/plugin-syntax-dynamic-import",
              ],
            },
          },
        ],
      },
    ];
  };

  /* ================ 默认配置====================== */
  let config = {
    target: ["browserslist"],
    mode: isProduction ? "production" : "development",
    // Stop compilation early in production
    bail: isProduction,
    ...(!isProduction ? { devtool: "cheap-module-source-map" } : {}),
    entry: {
      ["app"]: paths.appIndexJs,
    },
    output: {
      clean: true,
      path: paths.appBuild,
      filename: isProduction
        ? `static/js/[name].[contenthash:8].js`
        : "static/js/bundle.js",
      // There are also additional JS chunk files if you use code splitting.
      chunkFilename: isProduction
        ? `static/js/[name].[contenthash:8].chunk.js`
        : "static/js/[name].chunk.js",
      assetModuleFilename: "static/media/[name].[contenthash:8][ext]",
      publicPath: paths.publicUrlOrPath,
    },
    cache: {
      type: "filesystem",
      // version: createEnvironmentHash(env.raw),
      cacheDirectory: paths.appWebpackCache,
      store: "pack",
      buildDependencies: {
        defaultWebpack: ["webpack/lib/"],
        config: [__filename],
        tsconfig: [paths.appTsConfig, paths.appJsConfig].filter((f) =>
          fs.existsSync(f)
        ),
      },
    },
    optimization: {
      minimize: isProduction,
      minimizer: [
        // This is only used in production mode
        // new TerserPlugin({
        //   terserOptions: {
        //     parse: {
        //       // We want terser to parse ecma 8 code. However, we don't want it
        //       // to apply any minification steps that turns valid ecma 5 code
        //       // into invalid ecma 5 code. This is why the 'compress' and 'output'
        //       // sections only apply transformations that are ecma 5 safe
        //       // https://github.com/facebook/create-react-app/pull/4234
        //       ecma: 8,
        //     },
        //     compress: {
        //       ecma: 5,
        //       warnings: false,
        //       // Disabled because of an issue with Uglify breaking seemingly valid code:
        //       // https://github.com/facebook/create-react-app/issues/2376
        //       // Pending further investigation:
        //       // https://github.com/mishoo/UglifyJS2/issues/2011
        //       comparisons: false,
        //       // Disabled because of an issue with Terser breaking valid code:
        //       // https://github.com/facebook/create-react-app/issues/5250
        //       // Pending further investigation:
        //       // https://github.com/terser-js/terser/issues/120
        //       inline: 2,
        //     },
        //     mangle: {
        //       safari10: true,
        //     },
        //     output: {
        //       ecma: 5,
        //       comments: false,
        //       // Turned on because emoji and regex is not minified properly using default
        //       // https://github.com/facebook/create-react-app/issues/2488
        //       ascii_only: true,
        //     },
        //   },
        // }),

        //使用esbuild 加速
        new TerserPlugin({
          minify: TerserPlugin.esbuildMinify,
          // `terserOptions` options will be passed to `esbuild`
          // Link to options - https://esbuild.github.io/api/#minify
          // Note: the `minify` options is true by default (and override other `minify*` options), so if you want to disable the `minifyIdentifiers` option (or other `minify*` options) please use:
          // terserOptions: {
          //   minify: false,
          //   minifyWhitespace: true,
          //   minifyIdentifiers: false,
          //   minifySyntax: true,
          // },
          terserOptions: {},
        }),

        // This is only used in production mode
        new CssMinimizerPlugin(),
      ],
    },
    // Determine how modules within the project are treated
    module: {
      strictExportPresence: true,
      rules: [
        {
          oneOf: [...getJsRules(), ...getCssRules(), ...getFileRules()],
        },
      ],
    },

    // Customize the webpack build process
    plugins: [
      new FriendlyErrorsWebpackPlugin(),
      new WebpackBar(),
      new WebpackManifestPlugin({
        fileName: "asset-manifest.json",
        publicPath: paths.publicUrlOrPath,
      }),
      new HtmlWebpackPlugin({
        template: paths.appHtml,
        inject: true,
        buildTime: dayjs().format("YYYY-MM-DD H:mm:ss"),
        version: `${env["VERSION"]}`,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: paths.appPublic,
            to: paths.appBuild,
            globOptions: {
              ignore: ["**/index.html"],
            },
          },
        ],
      }),
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
      }),
      ...(isProduction
        ? [
            //css文件提取
            new MiniCssExtractPlugin({
              // Options similar to the same options in webpackOptions.output
              // both options are optional
              filename: "static/css/[name].[contenthash:8].css",
              chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
            }),
          ]
        : [
            //ts类型检查,待商榷:生产模式不打开?
            new ForkTsCheckerWebpackPlugin({
              async: !isProduction,
              typescript: {
                typescriptPath: resolve.sync("typescript", {
                  basedir: paths.appNodeModules,
                }),
                configOverwrite: {
                  compilerOptions: {
                    sourceMap: true,
                    skipLibCheck: true,
                    inlineSourceMap: false,
                    declarationMap: false,
                    noEmit: true,
                    incremental: true,
                    tsBuildInfoFile: paths.appTsBuildInfoFile,
                  },
                },
                context: paths.appPath,
                diagnosticOptions: {
                  syntactic: true,
                },
                mode: "write-references",
                // profile: true,
              },
              issue: {
                // This one is specifically to match during CI tests,
                // as micromatch doesn't match
                // '../cra-template-typescript/template/src/App.tsx'
                // otherwise.
                include: [
                  { file: "../**/src/**/*.{ts,tsx}" },
                  { file: "**/src/**/*.{ts,tsx}" },
                ],
                exclude: [
                  { file: "**/src/**/__tests__/**" },
                  { file: "**/src/**/?(*.){spec|test}.*" },
                  { file: "**/src/setupProxy.*" },
                  { file: "**/src/setupTests.*" },
                ],
              },
              logger: {
                infrastructure: "silent",
              },
            }),
            //热更新
            new ReactRefreshWebpackPlugin({
              overlay: false,
            }),
            //拼写检查
            new CaseSensitivePathsPlugin(),
          ]),
    ],

    resolve: {
      symlinks: true,
      extensions: paths.moduleFileExtensions.map((ext) => `.${ext}`),
      alias: {
        "@public": path.join(paths.appPath, "./public"),
        "@app": path.join(paths.appPath, "./src/app"),
        "@common": path.join(paths.appPath, "./src/common"),
        "@model": path.join(paths.appPath, "./src/model"),
        "@components": path.join(paths.appPath, "./src/common/components"),
        "@locales": path.join(paths.appPath, "./src/locales"),
        "@pages": path.join(paths.appPath, "./src/pages"),
      },
      fallback: {
        ...Object.keys(nodeLibs).reduce((memo, key) => {
          if (nodeLibs[key]) {
            memo[key] = nodeLibs[key];
          } else {
            memo[key] = false;
          }
          return memo;
        }, {}),
      },
    },

    externals: {
      ["lodash"]: "window['@houqi/libs'].lodash",
      ["react"]: "window['@houqi/libs'].React",
      ["react-dom"]: "window['@houqi/libs'].ReactDOM",
      ["react-router-dom"]: "window['@houqi/libs'].ReactRouterDom",
      ["moment"]: "window['@houqi/libs'].moment",
      ["@houqi/components"]: "window['@houqi/libs'].houqiComponents",
      ["i18next"]: "window['@houqi/libs'].i18next",
      ["react-i18next"]: "window['@houqi/libs'].reactI18next",
    },
  };

  /* ================ 覆盖配置====================== */
  if (fs.existsSync(paths["overWriteFile"])) {
    try {
      const overwrite = loadModule(paths["overWriteFile"], paths.appPath);
      if (isFunction(overwrite)) {
        config = overwrite(config, webpackEnv);
      }
    } catch (err) {
      console.error(err);
    }
  }

  /* ================ 性能调试插件 ====================== */
  if (!!env["ENABLE_ANALYZER"] && isProduction) {
    config.plugins.push(new BundleAnalyzerPlugin());
  }
  // it has  bug when use MiniCssExtractPlugin and webpack5
  // see https://github.com/stephencookdev/speed-measure-webpack-plugin/issues/167
  // const smp = new SpeedMeasurePlugin();
  // config = smp.wrap(config);

  return config;
};
