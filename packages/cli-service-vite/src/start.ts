
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

import { createServer } from 'vite';
import getConfig from './getConfig';
import { get } from "lodash"


export async function dev() {

  let viteConfig = await getConfig()

  const server = await createServer({
    ...viteConfig,
    configFile: false,
    server: { ...get(viteConfig, "server", {}), middlewareMode: 'html' },
  });

  await server.listen()
  server.printUrls()

}
