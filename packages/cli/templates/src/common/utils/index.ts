export const isDev = process.env.NODE_ENV === 'development';
export let IS_DEV_MODE = localStorage.getItem('__WEB_DEV_MODE__') === 'true' || isDev; //是否打开了调试环境
