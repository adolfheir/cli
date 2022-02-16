/*
此处管理所有可控制的环境变量,方便后续维护
原则:导出的环境变量定义需明确&有具体含义
错误示范:IS_GUANGMAI:false //是否是广脉环境 (广脉环境变了啥 需定义到每个变量)
正确示范:GLOBAL_IS_HELMET_SHOW:true //是否展示头盔检索
 */

// ========================== 所有的变量 =========================
//是否是开发环境
export let isDev = process.env.NODE_ENV === 'development';
export let IS_DEV_MODE = localStorage.getItem('__WEB_DEV_MODE__') === 'true' || isDev; //是否打开了调试环境
