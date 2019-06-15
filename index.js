#!/usr/bin/env node
const http = require('http');
const ProxyForHttp = require("./proxy-for-http");
const ProxyForHttps = require("./proxy-for-https");

// 初始化过程
// 获取运行端口 + 获取代理服务器http地址
const program = require('commander');

program
  .version('1.0.0', '-v, --version')
  .option('-p, --port [value]', '代理服务器运行的端口，默认6789', 6789)
  .option('-u, --urlfrag [value]', '只对包含此url片段的文件进行代理, 默认ux/beisen-chat-robot', "ux/beisen-chat-robot")
  .option('-o --host [value]', '服务资源提供者，默认http://localhost:3000', 'http://localhost:3000')
  .parse(process.argv);


const host = program.host;
const port = program.port;
const urlfrag =program.urlfrag;

let httpMitmProxy = new http.Server();

// 代理http请求
httpMitmProxy.on('request', (req, res) => {
  ProxyForHttp(req,res,host, urlfrag);
  res.on('error', () => {
    console.log('响应异常中断')
  })
});

// https的请求通过http隧道方式转发
// 代理https请求
httpMitmProxy.on('connect', (req, res, head) => {
  console.log('https请求传入...')
  ProxyForHttps(req,res, head, host, urlfrag);
  res.on('error', () => {
    console.log('响应异常中断')
  })
});






httpMitmProxy.listen(port, function () {
  console.log(`HTTP中间人代理启动成功，端口：${port}`);
});

httpMitmProxy.on('error', (e) => {
  if (e.code == 'EADDRINUSE') {
    console.error('HTTP中间人代理启动失败！！');
    console.error(`端口：${port}，已被占用。`);
  } else {
    console.error(e);
  }
});

