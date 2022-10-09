
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

import { createServer } from 'vite';
import getConfig from './getConfig';


async function run() {

  let viteConfig = await getConfig()

  const server = await createServer({
    ...viteConfig,
    configFile: false,
  });

  await server.listen()
  server.printUrls()
}

run()
