const path = require('path');
const http = require('http');
const url = require('url');
const https = require('https');
const notifier = require('node-notifier');


const extractAsset = (str = '') => {
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
    linkHash[key] = linkHash[key]  || [];
    linkHash[key].push(value);
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
const matchFileFromArray = (arr, fileNameInPieces, linkHash, originUrl) => {
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
    return getUrlFromAccurateMatch(linkHash[arr[maxValueIndex]], originUrl)
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
      console.log('非精确匹配了,',fileNameInPieces.join('.'));
      return getUrlFromAccurateMatch(linkHash[result[0]], originUrl);
    } else if (result.length > 1){
      console.log('多个匹配出现，无法区分')
    } else if (result.length < 1) {
      console.log('找不到匹配')
    }
  }
  
}

const matchResource = (fileNameInPieces = '', linkHash, originUrl) => {
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
  
  return getUrlFromBlurryMatchArr(matchArr, fileNameInPieces, linkHash, originUrl);
}


const getUrlFromBlurryMatchArr = (blurryMatchArr, fileNameInPieces, linkHash, originUrl) => {
  // 如果match arr
  if (blurryMatchArr.length === 0) return '';
  if (blurryMatchArr.length === 1) return getUrlFromAccurateMatch(linkHash[blurryMatchArr[0]], originUrl);
  if (blurryMatchArr.length > 1) return matchFileFromArray(blurryMatchArr, fileNameInPieces, linkHash, originUrl);
}

const getUrlFromAccurateMatch = (urlArr = [], originUrl) => {
  // 匹配到0个
  if (urlArr.length === 0) {
    console.log('😢error: 资源没有url地址');
    return '';
  }
  // 匹配到1个
  if (urlArr.length === 1) return urlArr[0];
  // 匹配到多个同名文件
  if (urlArr.length > 1) {
    // 处理规则，移除文件名后，看文件路径是否完全匹配
    const requestUrl = removeFileNameAndType(originUrl);
    const findUrl = urlArr.find((url) => {
      return requestUrl.indexOf(removeFileNameAndType(url)) !== -1
    });
    if (findUrl) return findUrl;
    return '';
  }
}

const removeFileNameAndType = (str = '') => {
  const replaceResult = str.replace(/(.*)\/(.*)/, '$1')
  return replaceResult;
};
const isMatchInclude = (urlPath, includeArray) => {
    if (includeArray === undefined || includeArray.length === 0) return true;
    return includeArray.every((rule) => {
      //判断rule是否match url
      const ruleInreg = new RegExp(rule);
      return ruleInreg.test(urlPath);
    })
}

const isPathMatchRule = (urlPath,excludeArray, includeArray) => {
  const matchInclude =  isMatchInclude(urlPath, includeArray);
  const matchExclude = !excludeArray.some((rule) => {
    //判断rule是否match url
    const ruleInreg = new RegExp(rule);
    return ruleInreg.test(urlPath);
  })
  return matchExclude && matchInclude
}
const isUrlNeedRequestLocal = (proxyedHostname, urlHostName,urlPath, excludeArray = [], includeArray = []) => {
  if (proxyedHostname !== urlHostName) return false;
  return isPathMatchRule(urlPath,excludeArray, includeArray)
}

// octet-stream代表二进制数据
const ignoreType=['font', 'octet-stream', 'image'];
const isIgnoredContentType = (fileType = '') => {
  // 对所有没有content-type的数据不做特殊处理（utf-8格式化。。。）
  if (fileType === '') return true;
  return ignoreType.some((typeStr) => {
    return fileType.indexOf(typeStr) !== -1;
  })
}


const setHeader = (realRes, res) => {
  let hasCrosSetting = false;
  //common header
  res.setHeader('Warning', "this file is from proxy server");

  
  // 设置客户端响应的http头部
  Object.keys(realRes.headers).forEach(function(key) {
    if (key === 'content-length') {
      return
    }
    res.setHeader(key, realRes.headers[key]);
    hasCrosSetting = (key === 'access-control-allow-origin');
  });
  
  if(hasCrosSetting === false) {
    // bugfix: web font 需要跨域
    res.setHeader('access-control-allow-origin', "*");
  };
  // 设置客户端响应状态码
  res.writeHead(realRes.statusCode);
}


const requestRealTarget =  (options,req, res, isHttp = true) => {
  // 根据客户端请求，向真正的目标服务器发起请求。
  let chunkCount = 0;
  let httpMethod = isHttp ? http : https;
  
  // 为了方便起见，直接去掉客户端请求所支持的压缩方式
  if(options.headers && options.headers['accept-encoding'] ) {
    delete options.headers['accept-encoding'];
  }
  if(options.headers && options.headers['cache-control'] ) {
    options.headers['cache-control'] = 'no-store';
  }
  
  let realReq = httpMethod.request(options, (realRes) => {
    console.log("statusCode", realRes.statusCode);
    const {statusCode} = realRes;
    const allowStatusCode = [200, 302, 301]
    // 对font type的数据不设置为utf-8格式，因为utf-8 格式会导致数据size错误，暂不知道原因
    const contentType = realRes.headers['content-type'];
    const isIgnoredType = isIgnoredContentType(contentType );
    if (isIgnoredType === false) realRes.setEncoding('utf8');
    
    // if (!allowStatusCode.includes(statusCode)) {
    //   res.end('code:'+ realRes.statusCode + "  "+realRes.statusMessage + " 代理的文件无法访问");
    //   return
    // }

    if (isIgnoredType === true) {
      setHeader(realRes, res);
      // 通过pipe的方式把真正的服务器响应内容转发给客户端
      realRes.pipe(res);
      return
    }
    
    
    
    let body = '';
    realRes.on('data', (chunk) => {
      // return '111' + chunk
      body += chunk;
    });
    
    realRes.on('end', () => {
      let b = body;
      //https://stackoverflow.com/questions/17922748/what-is-the-correct-method-for-calculating-the-content-length-header-in-node-js
      const length = Buffer.byteLength(b);
      res.setHeader('Pragma', "no-cache");
      res.setHeader('cache-control', "no-store");
      res.setHeader('content-length', length);
      setHeader(realRes, res);
      res.end(b)
    })
    
    
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
const createOptionsForLocalRequest = (localServerHostName) => {
      const urlOption = url.parse(localServerHostName);
      const {hostname, port, protocol} = urlOption;
      this.hostname = hostname;
      this.port = port;
      this.protocol = protocol;
      
      const optionsDefault= {
        protocol: 'http:',
          hostname: "localhost",
          method: 'GET',
          port: 3000,
          path: '/webpack-dev-server'
      }
      return {
        protocol: this.protocol || optionsDefault.protocol,
        hostname: this.hostname || optionsDefault.hostname,
        port: this.port || optionsDefault.port,
        path: optionsDefault.path,
        method: optionsDefault.method
      }
    
  
}


const createOptionFromCli = (configObject) => {
  const program = configObject;
  let configValue = {}
  const configName = program.configName;
  const currentDirection = process.cwd();
  if (configName) {
    const configFileAddress = path.join(__dirname,`../configs/${configName}`);
    configValue = require(configFileAddress);
  }
  
  let options = {
    localServerHostName:  configValue.localServerHostName || program.localServerHostName,
    // port: configValue.port || program.port,
    proxyedHostname:  configValue.proxyedHostname || program.proxyedHostname,
    excludePattern: configValue.excludePattern || [],
    includePattern: configValue.includePattern,
    customProxyRules: configValue.customProxyRules
  }
  return options;
}


const deleteBlankItemInArray = (arr) => {
  return arr.filter((v) => {
    return v !== ''
  })
};
/**
 * 解析customeRule
 * **/

const createOptionsFromCustomRule = (originOptions, originUrl,customProxyRules = [], proxyedHostname, excludePattern, includePattern) => {
  
  //
  
  // 只有originUrl 的 hostname 与 originOptions.hostName 相等才进行下一步
  if (originOptions.hostname !== proxyedHostname) return originOptions;
  if (isPathMatchRule(originOptions.path, excludePattern, includePattern) === false) return originOptions;
  
  let urlObj = url.parse(originUrl);
  let optionsNew = {...originOptions};
  
  customProxyRules.some((ruleObj) => {
    const {pathRewriteRule, byPass} = ruleObj;
    let matchRule,replacedRule;
    const rulesDetail = deleteBlankItemInArray(pathRewriteRule.trim().split(" "));
    
    if ((rulesDetail.length !== 2) && !ruleObj.pathReplaceFunc) {
      console.log("自定义规则中有多个非连续空格无法解析，只能存在一个或者多个连续空格 或不存在空格但是提供了替换函数pathReplaceFunc，请修改规则：", ruleObj);
      return false;
    }
    
    matchRule = rulesDetail[0];
    replacedRule = ruleObj.pathReplaceFunc || rulesDetail[1];
    
    let regRule = matchRule,regRuleType = 'g';
    const extractRule = matchRule.match(/^\/(.*)\/([gi]?)$/);
    if(extractRule) {
      //使用了js正则表达式
      regRule = extractRule[1].replace("/",'\/');
      regRuleType = extractRule[2] ? extractRule[2] : 'g'
    }
    
    let ruleInReg;
    try {
      ruleInReg = new RegExp(regRule, regRuleType);
    } catch(e) {
      console.log("正则表达式转换失败,请检查:", regRule);
      return false;
    }
    
    
    if (ruleInReg.test(urlObj.path)) {
      const pathAfterRewrite = urlObj.path.replace(ruleInReg, replacedRule);
      optionsNew.path = pathAfterRewrite;
      if(byPass) {
        // by pass
        const byPassObj = url.parse(byPass);
        const {protocol,port,hostname} = byPassObj;
        optionsNew.protocol = protocol;
        optionsNew.port = port ? port : (protocol === 'http:' ? 80 : 443);
        // options.path = options.path;
        optionsNew.hostname = hostname;
      }
      return true;
    }
  });
  optionsNew.headers.host = optionsNew.hostname;
  return optionsNew;
}

const getUrlFromOptions = (options) => {
  return options.protocol + options.hostname + ":" +options.port + options.path;
}

const add = path.join(__dirname, '../images/horrible.png');
const thinking = path.join(__dirname, '../images/thinking.png');

const showMessage = {
  error: (e) => {
    notifier.notify(
      {
        title: '请求出错了!',
        subtitle: e.subtitle,
        message: e.message,
        icon: add, // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: false // Wait with callback, until user action is taken against notification,
      }
    );
  },
  warnning: (e) => {
    notifier.notify(
      {
        title: '警告',
        subtitle: e.subtitle,
        message: e.message,
        open:e.open,
        icon: thinking, // Absolute path (doesn't work on balloons)
        sound: true, // Only Notification Center or Windows Toasters
        wait: true // Wait with callback, until user action is taken against notification,
      }
    );
  }
}
const configsManage = (function(){
  const  allConfigs = {}
  return {
    noProperty: function(configDataObj,propertyName){
      const noAttr = configDataObj[propertyName] === undefined;
      if (noAttr) {
        console.log(`配置文件中，没有必填项目${propertyName}，请检查!,当前配置文件将被忽略`)
      };
      return noAttr;
    },
    verifyConfigData: function(configDataObj){
      // 验证配置文件里面有如下必须值
      const mustProperty = ['localServerHostName',
        'proxyedHostname',
        'excludePattern',
        'includePattern'];
      const hasAllProperty = !mustProperty.some(this.noProperty.bind(this,configDataObj));
      return hasAllProperty;
    
    },
    update: function(configObj){
      const {configName, configData} = configObj;
      const verifySuc = this.verifyConfigData(configData);
      if (verifySuc === false) {
        console.log(`${configName} 配置文件格式有误，不能被添加`)
      } else {
        allConfigs[configName] = configData;
      }
    },
    getConfigByFileName: function(fileName){
      return allConfigs[fileName]
    },
    deleteConfig:function(fileName, callback){
      delete allConfigs[fileName];
      callback && callback();
    },
    getAllConfigs: function(){
      const temArr = [];
      for(let p in allConfigs) {
        temArr.push({fileName: p, fileData: allConfigs[p]});
      }
      return temArr;
    }
  }
})();

const isMatchHostName = (hostName = '') => {
  const allConfigs = configsManage.getAllConfigs();
  const configsInArray = Object.values(allConfigs);
  return configsInArray.some((v) => {
    const {fileData = {}} = v;
    const {proxyedHostname = ''} = fileData;
    return hostName === proxyedHostname
  })
}
const getProxyRule = function(urlString){
  //从config中找到合适的配置
  //满足条件：符合proxyedHostname、includePattern、excludePattern
  const allConfigs = configsManage.getAllConfigs();
  const configsInArray = Object.values(allConfigs);
  const urlObject = url.parse(urlString);

    const configMatched = configsInArray.filter((config) => {
      const urlHostName = urlObject.hostname;
      const urlPath = urlObject.path;
      const {proxyedHostname, excludePattern:excludeArray, includePattern:includeArray} = config.fileData;
      return isUrlNeedRequestLocal(proxyedHostname, urlHostName,urlPath, excludeArray, includeArray)
  });
  
  if (configMatched.length === 0) {
    console.log("没有配置文件符合当前的url", urlString);
    return
  }
  if (configMatched.length === 1) {
    return configMatched[0].fileData
  }
  if (configMatched.length > 1) {
    const e = {};
    const fileName = urlString.replace(/(.*)\/(.*)$/,'$2');
    console.log(`${urlString}找到多个匹配配置，优先选择第一个,假如选择的不是你想要的，请更改你的匹配规则，使其更加精确`);
    e.subtitle = `资源匹配到多个代理规则,可能匹配出错,请细化规则`;
    e.message = `点击访问${fileName}}`;
    e.open = urlString
    showMessage.warnning(e);
    return configMatched[0].fileData
  }
};
exports.extractAsset = extractAsset;
exports.getFileName = getFileName;
exports.splitFileNameInPieces = splitFileNameInPieces;
exports.matchResource = matchResource;
exports.isUrlNeedRequestLocal = isUrlNeedRequestLocal;
exports.requestRealTarget = requestRealTarget;
exports.createOptionsForLocalRequest = createOptionsForLocalRequest;
exports.createOptionFromCli = createOptionFromCli;
exports.createOptionsFromCustomRule = createOptionsFromCustomRule;
exports.getUrlFromOptions = getUrlFromOptions;
exports.showMessage = showMessage;
exports.configsManage = configsManage;
exports.getProxyRule = getProxyRule;
exports.isMatchHostName = isMatchHostName;
