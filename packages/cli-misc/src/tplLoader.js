const tplLoader = (content, map, meta) => {
  //特殊字符处理
  const formatTxt = (str) => {
    //特殊字符处理
    let specialwordList = ['`', '$'];
    let ret = str;
    for (let i = 0; i < specialwordList.length; i++) {
      let word = specialwordList[i];
      ret = ret.replaceAll(word, '\\' + word);
    }
    return ret;
  };
  let endTxt = `export default \`${formatTxt(content)}\``;
  // return endTxt
  return endTxt;
};
module.exports = tplLoader
