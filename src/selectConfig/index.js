const fs = require('fs');
const actions = require("../consts");
const {initProxyServer, getProxyServer} = require("../initialProxyServer")


const wsAbout = {
  getAllConfigFilesInfo: function() {
    const allFiels = fs.readdirSync('../configs', 'utf8');
    const allFielsInfo = [];
    
    allFiels.forEach((fileName) => {
      const fileData = require(`../configs/${fileName}`);
      allFielsInfo.push({
        fileName,
        fileData
      })
    });
    
    return allFielsInfo;
  },
  selectConfig: function(payload){
    const {fileName,fileData} = payload;
    const proxyServer = getProxyServer();
    if (proxyServer) {
      proxyServer.close && proxyServer.close()
    }
    initProxyServer({config: `../configs/${fileName}`}, this.startUpCallBack.bind(this, fileName, fileData))
    
  },
  startUpCallBack: function(fileName,fileData, statusObj){
    const params = {action: actions.START_CALLBACK, payload: {...statusObj, fileName, fileData}};
    const proxyServer = getProxyServer();
    if (statusObj.startSuc) {
      //存储当前运行的config信息
      this.currentConfig = {fileName,fileData}
    }
    this.ws.send(JSON.stringify(params))
  },
  getCurrentConfig: function(){
    return this.currentConfig
  },
  getMatchInfoFromAction: function(msgJson) {
    switch (msgJson.action) {
      case actions.FETCH_ALL_CONFIGS:
        return this.getAllConfigFilesInfo();
      case actions.SELECT_CONFIG:
        return this.selectConfig(msgJson.payload);
      case actions.GET_CURRENT_CONFIG:
        return this.getCurrentConfig()
      default :
        console.log("未找到对应数据",msgJson.action);
    
    }
  },
  initWs: function() {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ port: 9876 });
    wss.on('connection', (ws) => {
      this.ws = ws;
      ws.on('message', (message) => {
        let msg = {};
        try {
          msg = JSON.parse(message);
        } catch (e) {
          console.log('当前数据不为对象', message);
          return;
        }
        const info = this.getMatchInfoFromAction(msg);
        const params = {action: msg.action, payload: info};
        ws.send(JSON.stringify(params));
      });
      
      // ws.send('something');something
    });
  }
};

wsAbout.initWs();
// wsAbout.getAllConfigFilesInfo()
module.exports = wsAbout;


