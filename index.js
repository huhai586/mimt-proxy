#!/usr/bin/env node

const express = require('express');
const request = require('request');
const fs = require('fs');
const http = require('http');
const https = require('https');
const {extractAsset, getFileName, splitFileNameInPieces, matchResource} = require('./utils');
const app = express();

// 初始化过程
// 获取运行端口 + 获取代理服务器http地址
const program = require('commander');

program
  .version('1.0.0', '-v, --version')
  .option('-p, --port [value]', '代理服务器运行的端口，默认4000', 4000)
  .option('-u, --urlfrag [value]', '只对包含此url片段的文件进行代理')
  .option('-o --host [value]', '服务资源提供者，默认http://localhost:3000', 'http://localhost:3000')
  .parse(process.argv);


const host = program.host;
const port = program.port;
const urlfrag =program.urlfrag;

app.all('*', function(req, res) {
  console.log('请求url地址', req.url);
  const url = req.url;
  
  if (urlfrag && (url.indexOf(urlfrag) === -1)) {
    console.log('当前url不满足匹配条件，不做本地文件匹配', url);
    res.redirect(url);
    return
  } ;
  // 请求webpack-dev-server 服务文件list
  request(`${host}/webpack-dev-server`, function (error, response, body) {
    if (error) {console.log(error)};
    // console.log('statusCode:', response && response.statusCode);
    // 解析body
    const allLinkHash = extractAsset(body);
    // 对请求url进行拆解取得文件名
    // const mockUrl = 'http://stnew03.beisen.com/ux/beisen-chat-robot/release/dist/common-df04d232497a22c5db38.chunk.min.js';
    const fileNameWithType = getFileName(url);
    const fileNameInPiecesArray = splitFileNameInPieces(fileNameWithType);
    
    // 如果a能在b中找到全部匹配，那么a就是我们要找的本地资源
    // demoA = ['common', 'chunk'] demoB = ['common', 'chunk', 'min'] ,demoB中有demoA 的所有字段，可以通过判断交集数量的多少，来判断2个数组是否match
    const matchResourceResult = matchResource(fileNameInPiecesArray, allLinkHash)
    if (matchResourceResult !== '') {
      const assembUrl = `${host}${matchResourceResult}`;
      res.set('Warning', "this file is from proxy server");
      res.set('Pragma', "no-cache");
      res.redirect(assembUrl)
    } else {
      console.log("未能找到匹配文件, 尝试直接访问资源并转发", fileNameWithType);
      // 尝试直接获取url资源，并进行转发
      http.get(url, (response) =>{
        console.log(res.statusCode);
        const { statusCode } = response;
        const contentType = response.headers['content-type'];
        let error;
        if (statusCode !== 200) {
          error = new Error('Request Failed.\n' +
            `Status Code: ${statusCode}`);
        }
        if (error) {
          console.log("--------------------------------------------------------");
          res.set('Warning', "this file is from proxy server");
          res.status(404).send('Sorry, we cannot find that!');
        };
        
        let rawData = '';
        response.on('data', (chunk) => { rawData += chunk; });
  
        response.on('end', () => {
          res.set('Warning', "this file is from proxy server");
          res.end(rawData)
        });
        
      }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        console.log("--------------------------------------------------------");
        res.set('Warning', "this file is from proxy server");
        res.status(404).send('Sorry, we cannot find that!');
      });;

    }
  });
  
});

app.listen(port, function () {
  console.log(`代理服务器运行在端口: ${port},  代理的主机是${host},  ${urlfrag ? '必须匹配的url片段是:' : '无必须匹配的代码片段'}`);
});
// fs.readFileSync('server.key')


https.createServer({
    key: fs.readFileSync(__dirname+'/server.key'),
    cert: fs.readFileSync(__dirname+'/server.cert')
  }, app)
  .listen(8080, function () {
    console.log('https服务运行在 8080! Go to https://localhost:8080/')
  })

