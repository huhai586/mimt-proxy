#!/usr/bin/env node
const http = require('http');
const path = require('path');
const url = require('url');
const {createOptionsForLocalRequest, createOptionFromCli} = require('./utils');
const ProxyForHttp = require("./proxy-for-http");
const ProxyForHttps = require("./proxy-for-https");

// 初始化过程
// 获取运行端口 + 获取代理服务器http地址
const program = require('commander');

program
  .version('1.0.0', '-v, --version')
  .option('-p, --port [value]', '代理服务器运行的端口，默认6789', 6789)
  .option('-h, --proxyedHostname [value]', '只对只对指定hostname的资源进行本地请求,默认stnew03.beisen.com', "stnew03.beisen.com")
  .option('-o --localServerHostName [value]', '服务资源提供者，默认http://localhost:3000', 'http://localhost:3000')
  .option('-o --config [value]', '代理配置文件')
  .parse(process.argv);

let {localServerHostName, port, proxyedHostname, excludePattern} = createOptionFromCli(program);

//初始化localRequest options
createOptionsForLocalRequest.init(localServerHostName);

let httpMitmProxy = new http.Server();

// 代理http请求
httpMitmProxy.on('request', (req, res) => {
  ProxyForHttp(req,res,proxyedHostname, excludePattern);
  res.on('error', () => {
    console.log('响应异常中断')
  })
});

// https的请求通过http隧道方式转发
// 代理https请求
httpMitmProxy.on('connect', (req, cltSocket, head) => {
  console.log('https请求传入...')
  ProxyForHttps(req,cltSocket, head,proxyedHostname, excludePattern);
  cltSocket.on('error', () => {
    console.log('响应异常中断')
  })
});






httpMitmProxy.listen(port, function () {
  console.log(`HTTP/HTTPS中间人代理启动成功，端口：${port}`);
});

httpMitmProxy.on('error', (e) => {
  if (e.code == 'EADDRINUSE') {
    console.error('HTTP/HTTPS中间人代理启动失败！！');
    console.error(`端口：${port}，已被占用。`);
  } else {
    console.error(e);
  }
});

