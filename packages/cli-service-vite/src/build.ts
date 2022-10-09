process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

import { build } from 'vite';
import getConfig from './getConfig';


async function run() {

  let viteConfig = await getConfig()
  await build(viteConfig)

}

run
