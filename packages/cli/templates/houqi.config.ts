// @ts-ignore
const path = require('path');

module.exports = (config) => {
  // config.externals = config.externals || {};
  //重置全局变量
  config.externals = {};
  config.resolve.alias = {
    '@public': path.join(__dirname, './public'),
    '@app': path.join(__dirname, './src/app'),
    '@assets': path.join(__dirname, './src/assets'),
    '@model': path.join(__dirname, './src/model'),
    '@common': path.join(__dirname, './src/common'),
    '@constants': path.join(__dirname, './src/common/constants'),
    '@utils': path.join(__dirname, './src/common/utils'),
    '@hooks': path.join(__dirname, './src/common/hooks'),
    '@components': path.join(__dirname, './src/common/components'),
    '@materia': path.join(__dirname, './src/common/materia'),
    '@pages': path.join(__dirname, './src/pages'),
  };
  // config['devtool'] = 'source-map';

  //TDDO: css懒加载失效?
  // config['plugins'].push(
  //   new ArcoWebpackPlugin({
  //     // theme: '@arco-themes/react-zhst',
  //     theme: require.resolve('@arco-themes/react-zhst'),
  //   }),
  // );
  // config['cache'] = false;
  return config;
};
