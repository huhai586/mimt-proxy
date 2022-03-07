/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname
 

 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/
 module.exports = {
    "description": "[Ocean]-tms-setreport-backbone页面",
    "excludePattern": [],
    "includePattern": [
        "tms-setreport/release/app"
    ],
    "localServerHostName": "http://localhost:8000",
    "proxyedHostname": "stnew03.beisen.com",
     "requestMiddleware": [
         {
             "originUrlPathFragment": /\/ux\/tms-setreport\/release/g,
             // "originUrlPathFragment": "1.0.66",
             "fragmentTransformer": (a,b,c,d) => {
                 return ''
                 // // -2203071419.min
                 // console.log({a,b,c,d})
                 // const originStr = c;
                 // return originStr.replace("/ux/tms-setreport/release", '').replace(/-[\d]+\.min/, '')
             },
             "route2Host": "http://localhost:8000"
         },

         {
             "originUrlPathFragment": /-[\d]+\.min/,
             // "originUrlPathFragment": "1.0.66",
             "fragmentTransformer": (a,b,c,d) => {
                 return ''

             },

         },

     ],
    "enable": true
}