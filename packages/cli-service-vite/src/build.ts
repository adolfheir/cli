process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

import { build } from 'vite';
import getConfig from './getConfig';


async function run() {

  let viteConfig = await getConfig()

  try {
    let stats = await build(viteConfig)
    // console.log("build stats", stats)
  } catch (error) {
    console.error(error)
    throw error
  }

}
run()
