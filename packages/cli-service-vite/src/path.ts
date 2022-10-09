
import * as fs from "fs"
import * as path from "path"

export const appDirectory = fs.realpathSync(process.cwd());
export const userConfig = path.resolve(appDirectory, "houqi.config.ts");
