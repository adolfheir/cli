//@ts-nocheck
import logger from 'loglevel';
import { IS_DEV_MODE } from '@common/utils';
// import initResource from '@locales';

if (IS_DEV_MODE) {
  logger.setLevel('trace');
} else {
  logger.setLevel('warn');
}

//先用这个实现功能 后续看看
import(/* webpackChunkName: "intro" */ './app/index');
