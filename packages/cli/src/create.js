const path = require("path");
const mkdirp = require("mkdirp");
const glob = require("glob")
const { statSync, copyFileSync, writeFileSync } = require("fs");
const { chalk } = require("@ihouqi/cli-utils");
//模板路径
const tplPath = path.join(__dirname, "../templates");

const create = () => {

  //模板参数
  const context = {};
  //路径
  const cwd = process.cwd()

  //获取全部文件
  const files = glob.sync("**/*", {
    cwd: tplPath,
    dot: true,
    ignore: ["**/node_modules/**"],
  });
  console.log("files,files",files)
  files.forEach((file) => {
    const absFile = path.join(tplPath, file);
    if (statSync(absFile).isDirectory()) return;

    if (file.endsWith(".tpl")) {
      //模板替换
      const tpl = readFileSync(absFile, "utf-8");
      const content = ejs.render(tpl, context);
      const absTarget = path.join(cwd, file.replace(/\.tpl$/, ""));
      mkdirp.sync(path.dirname(absTarget));
      writeFileSync(absTarget, content, "utf-8");
      console.log(
        `${chalk.green("Write:")} ${path.relative(cwd, absTarget)}`
      );
    } else {
      //文件拷贝
      const absTarget = path.join(cwd, file);
      mkdirp.sync(path.dirname(absTarget));
      copyFileSync(absFile, absTarget);
      console.log(`${chalk.green("Copy: ")} ${path.relative(cwd, absTarget)}`);
    }
  });
};

module.exports = create;
