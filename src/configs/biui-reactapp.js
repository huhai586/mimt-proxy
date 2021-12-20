/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname


 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/
 module.exports = {
    "description": "biui-reactapp",
    "excludePattern": [],
    "includePattern": [
        "reactapp"
    ],

    "localServerHostName": "http://localhost:8003",
    "requestMiddleware": [
      {
        "originUrlPathFragment": "/poor/",
        "fragmentTransformer": () => {return 'xxxx'},
        "route2Host": ""
      }
    ],
    "enable": true
}