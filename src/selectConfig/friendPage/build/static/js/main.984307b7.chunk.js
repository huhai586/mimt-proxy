(this.webpackJsonpchooseconfig=this.webpackJsonpchooseconfig||[]).push([[0],{107:function(e,t,n){e.exports=n(179)},112:function(e,t,n){},113:function(e,t,n){},114:function(e,t,n){},175:function(e,t,n){e.exports=n.p+"static/media/rootCA.45130045.crt"},177:function(e,t,n){e.exports=n.p+"static/media/pac-tip.eea764fb.png"},179:function(e,t,n){"use strict";n.r(t);var a=n(0),o=n.n(a),c=n(8),i=n.n(c),r=(n(112),n(48)),s=n(49),l=n(54),f=n(50),u=n(56),d=(n(113),n(186)),p=n(181),C=n(182),g=n(189),m=n(183),E=n(187),h=(n(114),n(185)),S=n(184),v=n(180),y=n(188),_=n(10),A=h.a.confirm,N=S.a.Meta,O={delete:"delete",select:"select",edit:"edit"},T=function(e){function t(){var e,n;Object(r.a)(this,t);for(var a=arguments.length,o=new Array(a),c=0;c<a;c++)o[c]=arguments[c];return(n=Object(l.a)(this,(e=Object(f.a)(t)).call.apply(e,[this].concat(o)))).restartConfirm=function(){A({title:"\u5207\u6362\u914d\u7f6e",content:"\u4ee3\u7406\u670d\u52a1\u5668\u8fd0\u884c\u4e2d\uff0c\u9700\u8981\u6362\u5230\u5f53\u524d\u914d\u7f6e\u5417\uff1f",okText:"\u597d\u7684",okType:"danger",cancelText:"\u53d6\u6d88\u5207\u6362",onOk:function(){n.selectConfigConfirm()},onCancel:function(){console.log("Cancel")}})},n.selectCurItem=function(){n.selectConfigConfirm()},n.selectConfigConfirm=function(){n.props.selectConfig(n.props.data)},n.editCurItem=function(){n.props.editConfig(n.props.data)},n.doAction=function(e){switch(e){case O.select:n.selectCurItem();break;case O.edit:n.editCurItem();break;default:console.log("\u6ca1\u6709\u76f8\u5e94\u7684action",e)}},n.turnOffProxyServer=function(){n.props.stopCurConfig&&n.props.stopCurConfig()},n}return Object(u.a)(t,e),Object(s.a)(t,[{key:"render",value:function(){var e=this,t=this.props.data;return o.a.createElement(v.a,{spinning:this.props.runing,tip:o.a.createElement("div",{onClick:this.turnOffProxyServer},"\u4ee3\u7406\u4e2d,\u70b9\u51fb\u53ef\u505c\u6b62... ")},o.a.createElement("div",null,o.a.createElement(S.a,{title:o.a.createElement("div",null,o.a.createElement(y.a,{count:this.props.itemIndex+1,style:{backgroundColor:"#52c41a"}}),t.fileData.description),actions:[o.a.createElement("div",{className:"icon-container",onClick:function(){e.doAction(O.select)}},o.a.createElement(_.a,{type:"heart",key:"heart"}),o.a.createElement("span",null,"\u9009\u62e9")),o.a.createElement("div",{className:"icon-container",onClick:function(){e.doAction(O.edit)}},o.a.createElement(_.a,{type:"edit",key:"edit"}),o.a.createElement("span",null,"\u4fee\u6539")),o.a.createElement("div",{className:"icon-container"},o.a.createElement(_.a,{type:"delete",key:"delete"}),o.a.createElement("span",null,"\u5220\u9664"))]},o.a.createElement(N,{description:o.a.createElement("div",null,t.fileData.description?t.fileData.description:"".concat(t.fileName,"\u65e0\u63cf\u8ff0"))}))))}}]),t}(a.Component),I=n(175),w=d.a.Panel,k={FETCH_ALL_CONFIGS:"getAllConfig",SELECT_CONFIG:"select_config",EDIT_CONFIG:"edit_config",START_CALLBACK:"start_callback",GET_CURRENT_CONFIG:"get_current_config",CHECK_UPDATE:"CHECK_UPDATE",STOP_CONFIG:"STOP_CONFIG",GET_PAC_ADDRESS:"GET_PAC_ADDRESS"},b=function(e){function t(){var e,n;Object(r.a)(this,t);for(var a=arguments.length,o=new Array(a),c=0;c<a;c++)o[c]=arguments[c];return(n=Object(l.a)(this,(e=Object(f.a)(t)).call.apply(e,[this].concat(o)))).state={configs:[],startUpSuc:!1,runningConfigsName:[],connectError:!1,pacAddress:"",fetchAllConfigSuc:!1},n.selectConfig=function(e){var t={action:k.SELECT_CONFIG,payload:e};n.ws.send(JSON.stringify(t))},n.editConfig=function(e){var t={action:k.EDIT_CONFIG,payload:e};n.ws.send(JSON.stringify(t))},n.showMsg=function(e,t){p.a[e](t)},n.getPacAddress=function(){n.ws.send(JSON.stringify({action:k.GET_PAC_ADDRESS}))},n.processStartUp=function(e){n.showMsg(e.startSuc?"success":"error",e.msg),n.setState({startUpSuc:e.startSuc},(function(){n.state.startUpSuc&&(n.setState({runningConfigsName:e.fileName}),n.getPacAddress())})),n.ws.send(JSON.stringify({action:k.GET_CURRENT_CONFIG}))},n.setCurrentConfig=function(e){var t=e.map((function(e){return e.fileName}));n.setState({runningConfigsName:t}),0===t.length&&n.ws.send(JSON.stringify({action:k.GET_PAC_ADDRESS}))},n.setPacAddress=function(e){n.setState({pacAddress:e})},n.setSelectedItemData=function(e){n.setState({curItemConfig:e})},n.versionCompare=function(e){var t=e.latestVersion,a=e.localVersion;if(t!==a){var o="\u68c0\u6d4b\u5230\u65b0\u7248\u672c".concat(t,",\u5f53\u524d\u7248\u672c\u4e3a").concat(a,",\u8bf7\u5347\u7ea7\u83b7\u5f97\u66f4\u591a\u4ee3\u7406\u89c4\u5219\u652f\u6301 + \u9519\u8bef\u4fee\u590d");n.showUpdateTip(o)}},n.getCurConfig=function(){n.fetchAllConfig(),n.ws.send(JSON.stringify({action:k.GET_CURRENT_CONFIG}))},n.fetchAllConfig=function(){n.ws.send(JSON.stringify({action:k.FETCH_ALL_CONFIGS}))},n.checkUpdate=function(e){var t={action:k.CHECK_UPDATE,payload:e};n.ws.send(JSON.stringify(t))},n.showUpdateTip=function(e,t){C.a.info({message:t||"b-proxy-cli \u68c0\u6d4b\u5230\u65b0\u7248\u672c",duration:null,description:e})},n.stopConfig=function(e){var t={action:k.STOP_CONFIG,payload:e};n.ws.send(JSON.stringify(t))},n}return Object(u.a)(t,e),Object(s.a)(t,[{key:"componentWillUnmount",value:function(){clearInterval(this.t)}},{key:"componentDidMount",value:function(){var e=this,t=new WebSocket("ws://localhost:9876");this.ws=t,t.addEventListener("open",(function(t){console.log("Connection open ..."),e.setState({connectError:!1}),e.getCurConfig(),e.checkUpdate(),e.t=setInterval(e.fetchAllConfig,3e3)})),t.addEventListener("message",(function(t){var n;console.log("Received Message: ",t.data);try{n=JSON.parse(t.data)}catch(s){return void console.warn("\u4f20\u9012\u6570\u636e\u65e0\u6cd5json\u5316\uff0c\u683c\u5f0f\u9519\u8bef")}if(n.action===k.FETCH_ALL_CONFIGS&&(e.state.configs.length!==n.payload.length&&!0===e.state.fetchAllConfigSuc&&e.showUpdateTip("\u68c0\u6d4b\u5230\u914d\u7f6e\u6587\u4ef6\u6570\u91cf\u53d8\u5316\uff0c\u5df2\u7ecf\u66f4\u65b0\u6700\u65b0\u914d\u7f6e","\u914d\u7f6e\u6587\u4ef6\u5df2\u66f4\u65b0"),e.setState({configs:n.payload,fetchAllConfigSuc:!0})),n.action===k.START_CALLBACK){var a=n.payload;e.processStartUp(a)}if(n.action===k.GET_CURRENT_CONFIG){var o=n.payload;o&&e.setCurrentConfig(o),e.getPacAddress()}if(n.action===k.GET_PAC_ADDRESS){var c=n.payload;c&&e.setPacAddress(c)}if(n.action===k.EDIT_CONFIG){var i=n.payload;i&&e.setSelectedItemData(i)}if(n.action===k.CHECK_UPDATE){var r=n.payload;r&&e.versionCompare(r)}})),t.addEventListener("close",(function(t){console.log("Connection closed."),e.setState({connectError:!0}),setTimeout((function(){window.location.reload()}),1e4)}))}},{key:"render",value:function(){var e=this;return o.a.createElement("div",{className:"App"},this.state.connectError&&o.a.createElement(g.a,{message:"\u4e0e\u4ee3\u7406\u670d\u52a1\u5668\u7684\u901a\u4fe1\u5931\u8d25",description:"\u4ee3\u7406\u670d\u52a1\u5668\u53ef\u80fd\u6ca1\u6709\u542f\u52a8,10s\u540e\u7f51\u9875\u4f1a\u5237\u65b0\u91cd\u8bd5...",type:"error",showIcon:!0}),o.a.createElement("div",{className:"config-container"},this.state.configs.map((function(t,n){return o.a.createElement(T,{selectConfig:e.selectConfig,editConfig:e.editConfig,stopCurConfig:function(){e.stopConfig(t.fileName)},data:t,proxyIsRunning:0!==e.state.runningConfigsName.length,runing:e.state.runningConfigsName.includes(t.fileName),key:n,itemIndex:n})}))),o.a.createElement(m.a,null),o.a.createElement("div",{className:"footer"},o.a.createElement("a",{href:I,target:"_blank",download:!0},"\u70b9\u51fb\u4e0b\u8f7d\u6839\u8bc1\u4e66"),o.a.createElement("div",null,o.a.createElement("p",null,"            windows\u4e0b\u914d\u7f6e\u4fe1\u4efb\u6839\u8bc1\u4e66\uff1a",o.a.createElement("a",{target:"_blank",href:"https://jingyan.baidu.com/article/9f7e7ec0c1107c6f29155461.html"},"\u70b9\u51fb\u67e5\u770b")),o.a.createElement("p",null,"mac\u4e0b\u914d\u7f6e\u4fe1\u4efb\u6839\u8bc1\u4e66\uff1a",o.a.createElement("a",{target:"_blank",href:"https://blog.51cto.com/viming/2161919"},"\u70b9\u51fb\u67e5\u770b"))),!this.state.connectError&&o.a.createElement("div",null,o.a.createElement(E.a,{content:o.a.createElement("div",null,o.a.createElement("img",{src:n(177),alt:""})),title:"\u5728mac\u4e2d\u914d\u7f6e\u81ea\u52a8\u4ee3\u7406\u94fe\u63a5"},o.a.createElement("span",null,"\u81ea\u52a8\u4ee3\u7406\u914d\u7f6eurl\uff1a",this.state.pacAddress))),o.a.createElement(m.a,null),o.a.createElement(d.a,{accordion:!0},o.a.createElement(w,{header:"\u5982\u4f55\u5907\u4efd\u6211\u7684\u914d\u7f6e",key:"1"},o.a.createElement("p",null,"\u7ec4\u4ef6\u5347\u7ea7\u7684\u65f6\u5019\uff0c\u4f1a\u8986\u76d6\u5b89\u88c5\u7ec4\u4ef6\uff0c\u8986\u76d6\u914d\u7f6e\u6587\u4ef6\uff0c\u4e3a\u4e86\u4fdd\u5b58\u4f60\u7684\u914d\u7f6e\u6587\u4ef6\uff0c\u8bf7\u62f7\u8d1d\u914d\u7f6e\u6587\u4ef6\u5230\u5176\u4ed6\u5730\u65b9\uff0c\u5f53\u66f4\u65b0\u540e\uff0c\u62f7\u8d1d\u56de\u6765\u5373\u53ef")))))}}]),t}(a.Component);n(178);i.a.render(o.a.createElement(b,null),document.getElementById("root"))}},[[107,1,2]]]);
//# sourceMappingURL=main.984307b7.chunk.js.map