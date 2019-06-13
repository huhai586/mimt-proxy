#!/usr/bin/env node

const express = require('express');
const request = require('request');
const url = require('url');
const fs = require('fs');
const http = require('http');
const https = require('https');
const {extractAsset, getFileName, splitFileNameInPieces, matchResource} = require('./utils');
const {requestWebpackDevServer, requestRealTarget} = require("./requestWebpackDevServer");


// 初始化过程
// 获取运行端口 + 获取代理服务器http地址
const program = require('commander');

program
  .version('1.0.0', '-v, --version')
  .option('-p, --port [value]', '代理服务器运行的端口，默认6789', 6789)
  .option('-u, --urlfrag [value]', '只对包含此url片段的文件进行代理')
  .option('-o --host [value]', '服务资源提供者，默认http://localhost:3000', 'http://localhost:3000')
  .parse(process.argv);


const host = program.host;
const port = program.port;
const urlfrag =program.urlfrag;

let httpMitmProxy = new http.Server();

// 代理接收客户端的转发请求--普通http代理
httpMitmProxy.on('request', (req, res) => {
  // 解析客户端请求
  var urlObject = url.parse(req.url);
  let options =  {
    protocol: 'http:',
    hostname: req.headers.host.split(':')[0],
    method: req.method,
    port: req.headers.host.split(':')[1] || 80,
    path: urlObject.path,
    headers: req.headers,
  };
  
  // 为了方便起见，直接去掉客户端请求所支持的压缩方式
  delete options.headers['accept-encoding'];
  
  console.log(`请求方式：${options.method}，请求地址：${options.protocol}//${options.hostname}:${options.port}${options.path}`);
  
  // 请求webpack-dev-server 服务文件list;
  
  if (options.hostname === 'stnew03.beisen.com') {
    const optionsForLocalRequest = {
      protocol: 'http:',
      hostname: "localhost",
      method: 'GET',
      port: 3000,
      path: '/webpack-dev-server'
    };
    // console.log(`本地请求地址：${optionsForLocalRequest.method}，请求地址：${optionsForLocalRequest.protocol}//${optionsForLocalRequest.hostname}:${optionsForLocalRequest.port}${optionsForLocalRequest.path}`);
    requestWebpackDevServer(optionsForLocalRequest, res, req, host);
  } else {
    requestRealTarget(options, req, res)
  }
  
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

