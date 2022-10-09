process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";
//特殊变量
process.env.VITE_PREVIEW = "true";

import { preview as vitePreview } from 'vite'
import getConfig from './getConfig';

async function run() {

  let viteConfig = await getConfig()

  const previewServer = await vitePreview({
    ...viteConfig,
    // 任何有效的用户配置项，将加上 `mode` 和 `configFile`
    preview: {
      port: 8080,
      open: true
    }
  })

  previewServer.printUrls()
}

run()
