const path = require('path');
const http = require('http');
const url = require('url');
const https = require('https');


const extractAsset = (str) => {
  if (str === undefined) {
    debugger
  }
  const  matchArray = str.match(/<a href="([^>]*)">([^>]*)<\/a>/g);
  const linkHash = {};
  matchArray.forEach((v) => {
    const value = v.replace(/<a href="(.*)">(.*)/, (a,match) => {
      return match
    });
    const key = v.replace(/<a href="(.*)">(.*)<\/a>/, (a,match1, match2) => {
      return match2
    });
    
    linkHash[key] = value;
  });
  return linkHash;
}


const getFileName = (str) => {
  // console.log(str)
  return str.replace(/(.*)\//, '');
};

const splitFileNameInPieces = (str) => {
  // todo 文件名的组成成分可能有非- .
  return str.replace(/-/g, '.').split(".");
};

const matchFileType = (arr, fileType) => {
  return arr.filter((v) => {
    //filetype
    const fileNameInPieces = splitFileNameInPieces(v)
    const curfileType = fileNameInPieces[fileNameInPieces.length -1];
    return curfileType === fileType
  })
}
/**
 * 计算arr2种的string 在arr1种占比多少
 * **/
const calcPosPercentage = (arr1, arr2) => {
  let count = 0;
  arr1.forEach((str) => {
    if (arr2.includes(str)) {
      ++count
    }
  });
  return count/arr1.length
}
const matchFileFromArray = (arr, fileNameInPieces, linkHash) => {
  // 找寻arr中的文件类型与fileNameInPieces文件类型一样的
  // const match
  const getFilematchTypeArr = matchFileType(arr, fileNameInPieces[fileNameInPieces.length -1])
  // 计算匹配概率
  const prosibility = []
  getFilematchTypeArr.forEach((v, i) => {
    const currentItemNameInPieces = splitFileNameInPieces(v);
    prosibility[i] = calcPosPercentage(currentItemNameInPieces, fileNameInPieces)
  });
  
  // 依据概率，找到最大值
  const theMaxProbabilityValue = Math.max(...prosibility)
  // 最大概率值应该只有一个
  const maxValueCount = prosibility.filter((v) => v === theMaxProbabilityValue );
  if (maxValueCount.length === 1) {
    const maxValueIndex = prosibility.indexOf(theMaxProbabilityValue);
    return linkHash[arr[maxValueIndex]]
  } else {
    // 对比文件长度
    const mostMatchIndex =  [];
    prosibility.forEach((v,i) => {
      if (v === theMaxProbabilityValue) {
        mostMatchIndex.push(i)
      }
    });
    const mostMatchFile = mostMatchIndex.map((v) => arr[v]);
    
    //todo 感觉有问题
    const result = mostMatchFile.filter((v) => {
     return  splitFileNameInPieces(v).length === fileNameInPieces.length
    });
    
    if (result.length === 1) {
      console.log('非精确匹配了,',fileNameInPieces.join('.'))
      return linkHash[result[0]]
    } else if (result.length > 1){
      console.log('多个匹配出现，无法区分')
    } else if (result.length < 1) {
      console.log('找不到匹配')
    }
    
  }
  
}

const matchResource = (fileNameInPieces = '', linkHash) => {
  if (fileNameInPieces === '') {
    console.log('异常，需要匹配的文件名为空');
    return ''
  };
  
  const assetFileName = Object.keys(linkHash);
  const matchArr = assetFileName.filter((fileNameLocal) => {
    // fileNameLocal piecely
    const fileNameLocalPiece = splitFileNameInPieces(fileNameLocal);
  
    const filtType = fileNameInPieces[fileNameInPieces.length -1];
    const filtTypeOfFileNameLocal = fileNameLocalPiece[fileNameLocalPiece.length -1];
    
    // 先判断文件类型是否有问题
    if (filtType !== filtTypeOfFileNameLocal) return false
    // 将2个数组进行交集操作，判断2个array是否存在全交集
    // bug fileName 可能有重名，导致依据数量判断的情况下出错
    const fileNameInPiecesAfterRemoveRepeat = [...new Set([...fileNameInPieces])];
    const fileNameLocalPieceAfterRemoveRepeat = [...new Set([...fileNameLocalPiece])];
    const mixedArray = [... new Set([...fileNameInPiecesAfterRemoveRepeat, ...fileNameLocalPieceAfterRemoveRepeat])];
    
    return mixedArray.length === Math.max(fileNameInPiecesAfterRemoveRepeat.length , fileNameLocalPieceAfterRemoveRepeat.length);
  });
  
  if (matchArr.length !== 0) {
    if (matchArr.length === 1) {
      return linkHash[matchArr[0]]
    } else {
      // 匹配到多个文件
      const gotFile = matchFileFromArray(matchArr, fileNameInPieces, linkHash);
      return gotFile;
    }
  } else {
    return '';
  }
}

const isMatchInclude = (urlPath, includeArray) => {
    if (includeArray === undefined || includeArray.length === 0) return true;
    return includeArray.every((rule) => {
      //判断rule是否match url
      const ruleInreg = new RegExp(rule);
      return ruleInreg.test(urlPath);
    })
}

const isUrlPathNeedRequestLocal = (urlPath, excludeArray, includeArray) => {
  const matchInclude =  isMatchInclude(urlPath, includeArray)
  const matchExclude = !excludeArray.some((rule) => {
    //判断rule是否match url
    const ruleInreg = new RegExp(rule);
    return ruleInreg.test(urlPath);
  })
  return matchExclude && matchInclude
}


const requestRealTarget =  (options,req, res, isHttp = true) => {
  // 根据客户端请求，向真正的目标服务器发起请求。
  let chunkCount = 0;
  let httpMethod = isHttp ? http : https;
  let realReq = httpMethod.request(options, (realRes) => {
    
    // 设置客户端响应的http头部
    Object.keys(realRes.headers).forEach(function(key) {
      res.setHeader(key, realRes.headers[key]);
    });
    
    res.setHeader('Warning', "this file is from proxy server");
    // res.setHeader('Pragma', "no-cache");
    
    // 设置客户端响应状态码
    res.writeHead(realRes.statusCode);
    realRes.on('data', () => {
      // console.log('Receiving chunk', ++chunkCount)
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


/**
 * 设置默认参数
 * **/
const createOptionsForLocalRequest = {
  init: function(localServerHostName){
    const urlOption = url.parse(localServerHostName);
    
    const {hostName, port, protocol} = urlOption;
    this.hostName = hostName;
    this.port = port;
    this.protocol = protocol;
  },
  optionsDefault: {
    protocol: 'http:',
    hostname: "localhost",
    method: 'GET',
    port: 3000,
    path: '/webpack-dev-server'
  },
  getOptions: function(){
    const {optionsDefault} = this;
    return {
      protocol: this.protocol || optionsDefault.protocol,
      hostname: this.hostname || optionsDefault.hostname,
      port: this.port || optionsDefault.port,
      path: optionsDefault.path,
      method: optionsDefault.method
    }
  }
};


const createOptionFromCli = (program) => {
  
  let configValue = {}
  const config = program.config;
  const currentDirection = process.cwd();
  if (config) {
    const configFileAddress = path.join(currentDirection,`${config}`);
    configValue = require(configFileAddress);
  }
  
  let options = {
    localServerHostName: program.localServerHostName || configValue.localServerHostName,
    port: program.port || configValue.port,
    proxyedHostname: program.proxyedHostname || configValue.proxyedHostname,
    excludePattern: configValue.excludePattern || [],
    includePattern: configValue.includePattern,
    customProxyRules: configValue.customProxyRules
  }
  return options;
}


/**
 * 解析customeRule
 * **/

const createOptionsFromCustomRule = (customProxyRules,originOptions, originUrl) => {
  let urlObj = url.parse(originUrl);
  const options = {...originOptions};
  customProxyRules.some((ruleObj) => {
    const {pathRewriteRule, byPass} = ruleObj;
    const rulesDetail = pathRewriteRule.split(" ");
    const matchRule = rulesDetail[0];
    const replacedRule = rulesDetail[1];
    
    
    const extractRule = matchRule.match(/^\/(.*)\/(.*)$/);
    let regRule = matchRule,regRuleType = 'g';
    if(extractRule) {
      //使用了js正则表达式
      regRule = extractRule[1];
      regRuleType = extractRule[2] || 'g'
    }
    
    const ruleInReg = new RegExp(regRule, regRuleType);
    
    
    if (ruleInReg.test(urlObj.path)) {
      const pathAfterRewrite = urlObj.path.replace(ruleInReg, replacedRule);
      options.path = pathAfterRewrite;
      if(byPass) {
        // by pass
        const byPassObj = url.parse(byPass);
        const {protocol,port,hostname} = byPassObj;
        options.protocol = protocol;
        options.port = port ? port : (protocol === 'http:' ? 80 : 443);
        // options.path = options.path;
        options.hostname = hostname;
      }
      return true;
    }
  });
  return options;
}

const getUrlFromOptions = (options) => {
  return options.protocol + options.hostname + options.port + options.path;
}

exports.extractAsset = extractAsset;
exports.getFileName = getFileName;
exports.splitFileNameInPieces = splitFileNameInPieces;
exports.matchResource = matchResource;
exports.isUrlPathNeedRequestLocal = isUrlPathNeedRequestLocal;
exports.requestRealTarget = requestRealTarget;
exports.createOptionsForLocalRequest = createOptionsForLocalRequest;
exports.createOptionFromCli = createOptionFromCli;
exports.createOptionsFromCustomRule = createOptionsFromCustomRule;
exports.getUrlFromOptions = getUrlFromOptions;
