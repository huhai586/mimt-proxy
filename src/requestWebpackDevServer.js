const http = require('http');
const {extractAsset, getFileName, splitFileNameInPieces, matchResource} = require('./utils');
const {requestRealTarget} = require("./utils");
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


const requestWebpackDevServer = (optionsForLocalRequest, res, req) => {
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
    
    if (matchResourceResult !== '' && matchResourceResult !== undefined) {
      console.log(matchResourceResult)
      console.log('已经查找到本地匹配, 请求参数为',byPassRequestOptions )
      requestRealTarget(byPassRequestOptions, req, res);
    } else {
      console.log("未能在本地找到匹配文件,", fileNameWithType,'将返回404');
      res.writeHead(404, {'Content-Type': 'text/plain'})
      res.end();
    }
  });
  reWDV.end();
  reWDV.on('error', (e) => {
    console.error(e);
  })
};

module.exports = {
  requestWebpackDevServer
}