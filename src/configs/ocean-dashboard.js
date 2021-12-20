/**
 * @excludePattern regexp|string[] hostname下 请求资源url path中如果匹配这个字段，这个资源不会被代理到本地，直接访问原始资源
 * @includePattern regexp|string[] hostname下 请求资源url path必须include 相应字段才能被代理到本地
 * @localServerHostName string 本地资源服务器hostname


 * @customProxyRules rule{}[] 用户自定义代理规则，可以自定义hostname下的资源请求规则
 *
 * **/
 module.exports = {
    "category": "鲁班",
    "version": "1.0.0",
    "description": "ocean-图表dashboard",
    "excludePattern": [
    ],
    "includePattern": [
        'ocean-dashboard-page',"ChartSkeleton","images"
    ],
   "includeMatchStrategy": "some",
   "localServerHostName": "http://localhost:3008",
   "requestMiddleware": [
     {
       "originUrlPathFragment": /([\d]+\.[\d]+\.[\d]+)/g,
       "fragmentTransformer": (a,b,c,d) => {
         return ''
       }
     }
   ],
    "enable": true
}