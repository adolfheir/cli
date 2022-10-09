import * as fs from "fs"
import { UserConfig, mergeConfig } from 'vite';
import { get, isFunction, isObject } from "lodash"
import dayjs from "dayjs"
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import loadCssModulePlugin from 'vite-plugin-load-css-module';
import VitePluginInjectPreload from 'vite-plugin-inject-preload'
import { createHtmlPlugin } from 'vite-plugin-html'
import { visualizer } from "rollup-plugin-visualizer";
import checker from 'vite-plugin-checker'
import { loadModule } from "@houqi/cli-utils"
import { appDirectory, userConfig } from "./path"

const ENV = {
  CI_BUILD_NUMBER: get(process.env, "CI_BUILD_NUMBER", 0),
  GIT_BRANCH: get(process.env, "GIT_BRANCH", 0),
  GIT_COMMIT_SHORT: get(process.env, "GIT_COMMIT_SHORT",),
  ENABLE_ANALYZER: get(process.env, "ENABLE_ANALYZER", false),
}

const showAnalyze = !!ENV.ENABLE_ANALYZER

// https://vitejs.dev/config/
const baseConfig: UserConfig = {
  build: {
    outDir: './build',
    manifest: true,
    sourcemap: showAnalyze,
    rollupOptions: {
      output: {
        // 用于从入口点创建的块的打包输出格式[name]表示文件名,[hash]表示该文件内容hash值
        entryFileNames: 'static/js/[name].[hash].js',
        // 用于命名代码拆分时创建的共享块的输出命名
        chunkFileNames: 'static/js/[name].[hash].js',
        // 用于输出静态资源的命名，[ext]表示文件扩展名
        assetFileNames: (chunkInfo) => {
          let isCss = !!chunkInfo.name ? /\.css$/.test(chunkInfo.name) : false
          let ret = isCss ? 'static/css/[ext]/[name].[hash].[ext]' : 'static/asset/[name].[hash].[ext]'
          return ret
        },
      },
    }
  },
  css: {
    modules: {},
  },
  plugins: [
    react(),
    /* 检查ts */
    checker({ typescript: true, enableBuild: false }),
    svgrPlugin({
      exportAsDefault: true,
    }),
    loadCssModulePlugin({
      include: (id) => {
        //排除build环境id后面带后缀的影响
        let path = id.split("?").slice(0, 1).join("")
        let isGlobal = /\.global\.(scss|sass)$/.test(path)
        let isNodeModules = path.includes('node_modules')
        let isSass = /\.(scss|sass)$/.test(path)
        let isPass = !isGlobal && !isNodeModules && isSass
        return isPass
      },
    }),

    createHtmlPlugin({
      template: 'public/index.html',
      entry: "/src/index.tsx",
      minify: {
        collapseWhitespace: true,
        keepClosingSlash: true,
        removeComments: false,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
      },
      inject: {
        data: {
          ...ENV,
          BUILD_TIME: `${dayjs().format("YYYY-MM-DD H:mm:ss")}`,
          BUILD_TIME_STAMP: `${dayjs().valueOf()}`
        }
      }
    }),
    /* 此插件只在生产环境适用 开发环境拿不到所有bundle */
    VitePluginInjectPreload({
      files: [
        {
          match: /.woff2/,
          attributes: {
            type: 'font/woff2',
            as: 'font',
            crossorigin: 'anonymous',
          }
        },
      ],
    }),
    ...showAnalyze ? [visualizer({
      filename: './build/report-rollup-plugin-visualizer.html',
      brotliSize: true,
    })] : []

  ],
  resolve: {
    alias: {
      "@src": "/src",
      '@public': "/public",
      // '@app': "/src/app",
      // '@assets': "/src/assets",
      // '@model': "/src/model",
      // '@common': "/src/common",
      // '@constants': "/src/common/constants",
      // '@utils': "/src/common/utils",
      // '@hooks': "/src/common/hooks",
      // '@components': "/src/common/components",
      // '@materia': "/src/common/materia",
      // '@pages': "/src/pages",
    }
  }
}

const getConfig = async () => {
  let config: UserConfig = baseConfig;

  /* 获取用户配置 */
  if (fs.existsSync(userConfig)) {
    try {
      const overwrite = loadModule(userConfig, appDirectory);
      if (isObject(overwrite)) {
        config = mergeConfig(config, overwrite)
      }
      if (isFunction(overwrite)) {
        config = overwrite(baseConfig);
      }
    } catch (err) {
      console.error(err);
    }
  }

  return config
}

export default getConfig
