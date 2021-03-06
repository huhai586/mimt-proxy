#!/usr/bin/env node
const {initProxyServer} = require("./initialProxyServer");
const {configsManage} = require("./initialProxyServer/utils");
const wsAbout = require("./selectConfig")
// 初始化过程
// 获取运行端口 + 获取代理服务器http地址
const program = require('commander');

program
  .version('1.4.13', '-v, --version')
  .option('-p, --port [value]', '代理服务器运行的端口，默认6789', 6789)
  .option('--proxyedHostname [value]', '只对只对指定hostname的资源进行本地请求,默认stnew03.beisen.com', "stnew03.beisen.com")
  .option('--localServerHostName [value]', '服务资源提供者，默认http://localhost:3000', 'http://localhost:3000')
  .option('--config [value]', '代理配置文件')
  .option('--includePattern [value]', 'url path必须包含的字符串或者正则，如果包含了，则不走代理')
  .option('--excludePattern [value]', 'url path不能包含的字符串或者正则，如果包含了，则不走代理')
  .parse(process.argv);

// https://stackoverflow.com/questions/45088006/nodejs-error-self-signed-certificate-in-certificate-chain
// If that's the case, add NODE_TLS_REJECT_UNAUTHORIZED='0' as an environment variable wherever you are running node or running node directly with NODE_TLS_REJECT_UNAUTHORIZED='0' node app.js
// This instructs Node to allow untrusted certificates (untrusted = not verified by a certificate authority)

//允许node 信任自签名证书
process.env.NODE_TLS_REJECT_UNAUTHORIZED="0"
if(program.config === undefined) {
  //如果没有相应的配置文件，那么运行友好页面提示用户选择配置
  //启动后台服务+启动网页
  // NODE_TLS_REJECT_UNAUTHORIZED='0'
  wsAbout.initWsAndHttpServer(program.port);
  initProxyServer()
  
} else {
  console.log("目前不支持命令行方式启动")
  // initProxyServer(program)
}


