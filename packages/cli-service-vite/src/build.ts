process.env.BABEL_ENV = "production";
process.env.NODE_ENV = "production";

import { build } from 'vite';
import getConfig from './getConfig';


export async function dev() {

  let viteConfig = await getConfig()
  await build(viteConfig)

}
