const http = require('http');
const {extractAsset, getFileName, splitFileNameInPieces, matchResource} = require('./utils');

const getBody = (response) => {
  response.setEncoding('utf8');
  return new Promise((resolve, reject) => {
    let data = []
    response.on('data', chunk => {
      data.push(chunk)
    })
    response.on('end', () => {
      const body = data.join("");
      resolve(body)
    })
  })
};


const requestWebpackDevServer = (optionsForLocalRequest, res, req, host) => {
  let reWDV = http.request(optionsForLocalRequest,  async (WPDresponse) =>{
    let body = await getBody(WPDresponse);
    
    // 解析body
    const allLinkHash = extractAsset(body);
    // 对请求url进行拆解取得文件名
    const fileNameWithType = getFileName(req.url);
    const fileNameInPiecesArray = splitFileNameInPieces(fileNameWithType);
    
    // 如果a能在b中找到全部匹配，那么a就是我们要找的本地资源
    // demoA = ['common', 'chunk'] demoB = ['common', 'chunk', 'min'] ,demoB中有demoA 的所有字段，可以通过判断交集数量的多少，来判断2个数组是否match
    const matchResourceResult = matchResource(fileNameInPiecesArray, allLinkHash);
    
    const byPassRequestOptions = {
      ...optionsForLocalRequest,
      path: matchResourceResult
    };
    
    if (matchResourceResult !== '') {
      console.log('已经查找到匹配, 请求参数为',byPassRequestOptions )
      requestRealTarget(byPassRequestOptions, req, res);
    } else {
      console.log("未能找到匹配文件, 尝试直接访问资源并转发", fileNameWithType);
      res.end();
    }
  });
  reWDV.end();
  reWDV.on('error', (e) => {
    console.error(e);
  })
};


const requestRealTarget =  (options,req, res) => {
  // 根据客户端请求，向真正的目标服务器发起请求。
  let chunkCount = 0;
  let realReq = http.request(options, (realRes) => {
    
    // 设置客户端响应的http头部
    Object.keys(realRes.headers).forEach(function(key) {
      res.setHeader(key, realRes.headers[key]);
    });
  
    res.setHeader('Warning', "this file is from proxy server");
    res.setHeader('Pragma', "no-cache");
  
    // 设置客户端响应状态码
    res.writeHead(realRes.statusCode);
    realRes.on('data', () => {
      console.log('Receiving chunk', ++chunkCount)
    })
    // 通过pipe的方式把真正的服务器响应内容转发给客户端
    realRes.pipe(res);
  });
  
  // 通过pipe的方式把客户端请求内容转发给目标服务器
  req.pipe(realReq);
  
  realReq.on('error', (e) => {
    console.error(e);
  })
  realReq.on('end', (e) => {
    console.log('当前传输完毕');
  })
}
module.exports = {
  requestWebpackDevServer,
  requestRealTarget
}