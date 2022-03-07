//-----------------------------注入的自定义代码开始---------------------------
var  uniqClass = '--b-proxy-cli-proxy-tip';
window.BProoxyCliTipFunc = function(){
  var tip = document.querySelector(uniqClass);
  if (!tip) {
    var tempTipDom = document.createElement('div');

    tempTipDom.setAttribute('style', 'z-index: 1000000;border-radius: 10px;width: 16px;height:16px;background: #2ac72a;position: fixed;right:10px;bottom: 10px');
    document.body.appendChild(tempTipDom)
  } else {
    console.warn("已经存在")
  }
}

window.removeEventListener("load", window.BProoxyCliTipFunc);
window.addEventListener("load", window.BProoxyCliTipFunc);
//-----------------------------注入的自定义代码结束---------------------------
