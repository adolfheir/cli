/* todo:入口文件 & spain样式 &demo */
import * as fs from "fs-extra"
import * as path from "path"
import Fontmin from "fontmin"
// import extraWord from "./extraWord"

export interface Item {
  fontPath: string,
  walkdir: string,
  extraWord: string
}

export default (
  fontList: Item[], outputDir: string
) => {
  //过滤参数
  const filetypes = 'js|jsx|ts|tsx';
  const fileExtReg = new RegExp(`^\.${filetypes}`, 'i');

  // 额外文字
  // const outputDir = path.join(__dirname, '../src/assets/font');

  //辅助函数
  function getChineseChr(str) {
    const matched = str.match(/[^\x00-\x7F]/g);
    return Array.isArray(matched) ? matched.filter((ch, pos) => matched.indexOf(ch) === pos).join('') : '';
  }

  function uniqueu(str) {
    return [...new Set([...str])].join('');
  }

  function walk(dir) {
    return new Promise((resolve, reject) => {
      fs.readdir(dir, (error, files) => {
        if (error) {
          return reject(error);
        }
        Promise.all(
          files.map((file) => {
            return new Promise((resolve, reject) => {
              const filepath = path.join(dir, file);
              fs.stat(filepath, (error, stats) => {
                if (error) {
                  return reject(error);
                }
                if (stats.isDirectory()) {
                  walk(filepath).then(resolve);
                } else if (stats.isFile()) {
                  // resolve(filepath);
                  const ext = path.extname(filepath);
                  if (fileExtReg.test(ext)) {
                    fs.readFile(
                      filepath,
                      {
                        encoding: 'utf8',
                      },
                      (err, content) => {
                        if (err || typeof content !== 'string') {
                          console.error(err);
                          reject(err);
                          return;
                        }
                        resolve(getChineseChr(content));
                      },
                    );
                  } else {
                    resolve('');
                  }
                }
              });
            });
          }),
        ).then((foldersContents) => {
          resolve(foldersContents.reduce((all, folderContents) => all + folderContents, ''));
        });
      });
    });
  }

  //开始执行任务
  fs.emptyDirSync(outputDir);

  fontList.forEach(async ({ fontPath, walkdir, extraWord }) => {
    let content = (await walk(walkdir)) + extraWord + "0123456789";
    content = uniqueu(content);

    const fontmin = new Fontmin()
      .src(fontPath)
      .use(
        //@ts-ignore
        Fontmin.glyph({
          hinting: false,
          text: content || '#', // 传入任意字符避免 fontmin@0.9.5 BUG
        }),
      )
      //@ts-ignore
      .use(Fontmin.ttf2eot())
      .use(
        //@ts-ignore
        Fontmin.ttf2woff({
          deflate: true, // deflate woff. default = false
        }),
      )
      //@ts-ignore
      .use(Fontmin.ttf2woff2())
      .dest(outputDir);

    fontmin.run((err) => {
      if (err) {
        throw err;
      }
    });

  });
}
