const fs = require('fs');
const path = require('path');
const actions = require("../consts");
const {getIP} = require("../common/utils");
const {initProxyServer, getProxyServer} = require("../initialProxyServer")
const open = require('open');

const express = require('express');


const wsAbout = {
  getAllConfigFilesInfo: function() {
    const allFiels = fs.readdirSync(path.join(__dirname,'../configs'), 'utf8');
    const allFielsInfo = [];
    
    allFiels.forEach((fileName) => {
      const fileData = require(`${path.join(__dirname,'../configs')}/${fileName}`);
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
    initProxyServer({config: `${fileName}`}, this.startUpCallBack.bind(this, fileName, fileData))
    
  },
  createFile: () => {
    const proxyServer = getProxyServer();
    const {port} = proxyServer.address();
    const curIP = getIP();
    
    // 创建file并写入friendPage\build
  
    const str = `
      function FindProxyForURL(url, host) {
        return "PROXY ${curIP}:${port}";
      }
    `
    const oldPath = path.join(__dirname, "../../pac.js");
    fs.writeFileSync(oldPath,str,'utf8',function(error){
      if(error){
        console.log(error);
        return false;
      }
      console.log('写入成功');
    })
  },
  movePAC2build: function(){
    const oldPath = path.join(__dirname, "../../pac.js");
    const newPath = path.join(__dirname, "./friendPage/build/pac.js");
    fs.rename(oldPath, newPath, function (err) {
      if (err) throw err;
      console.log("pac 文件创建成功");
    });
  },
  initPacFile: function(){
    //创建pac.js 文件并提供服务
    this.createFile();
    //检测是否创建成功
    const pacFile = path.join(__dirname, "../../pac.js");
    console.log(pacFile)
    fs.readFile(pacFile, (err,buffer) => {
      if (err) {
        console.log('创建pac文件不成功!!!')
      } else {
        //移动文件
        this.movePAC2build()
      }
    });
    
  },
  getPacAddress:function() {
    const curIP = getIP();
    return `http://${curIP}:1347/pac.js`
  },
  startUpCallBack: function(fileName,fileData, statusObj){
    const params = {action: actions.START_CALLBACK, payload: {...statusObj, fileName, fileData}};
    if (statusObj.startSuc) {
      //存储当前运行的config信息
      this.currentConfig = {fileName,fileData}
    }
    this.initPacFile();
    // this.ws.send(JSON.stringify(params))
    this.sendMessage(params);

  },
  sendMessage: function(params){
    this.wss.clients.forEach(function each(client) {
    
      // console.log('IT IS GETTING INSIDE CLIENTS');
      // console.log(client);
    
      // The data is coming in correctly
      // console.log(data);
      client.send(JSON.stringify(params));
    });
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
        return this.getCurrentConfig();
      case actions.GET_PAC_ADDRESS:
        return this.getPacAddress()
      default :
        console.log("未找到对应数据",msgJson.action);
    
    }
  },
  initWs: function() {
    const WebSocket = require('ws');
    const wss = new WebSocket.Server({ port: 9876 });
    this.wss = wss;
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
        this.sendMessage(params);
      });
      
    });
  },
  initWsAndHttpServer: function(){
    //启动ws
    this.initWs();
    //启动http server
    const app = express();
    const fileLocation  = process.cwd();
    const indexHtml = fileLocation+'/src/selectConfig/friendPage/build/index.html';
    app.use(express.static(path.join(__dirname,'./friendPage/build')))
    app.get('/', (req, res) => res.sendFile(indexHtml))
    app.listen(1347,'0.0.0.0', () => {
      console.log('app listening on port 1347!');
      open("http://localhost:1347");
    })
  
  }
};

// wsAbout.initWs()
module.exports = wsAbout;


