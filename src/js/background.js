import {Message} from './class/Message';

(function(chrome) {
  var connectPorts = {};
  var tabs_Update = {};

  //will connect when taburl matches https://tw.carousell.com/*
  //and reconnect if browser refresh or redirect no using react route
  chrome.runtime.onConnect.addListener(connectHandler);
  //mainly detect redirecting which using react route
  //tab will update when scrolling winow
  chrome.tabs.onUpdated.addListener(tabUpdateHandler);
  chrome.contextMenus.onClicked.addListener((info,tab)=>{
    console.log(info);
    var port = connectPorts[`content-${tab.id}`];
    if(port){
      var match = /^productName-tags-(.+)$/g.exec(info.menuItemId);
      var tags = ["#含運最划算","#交換最划算"];
      if(match[1] && tags[match[1]]){
        port.postMessage(new Message('execute_contextmenu', {tag:tags[match[1]]}));//postMessage
      }
    }
  })

  function tabUpdateHandler(id,info,tab){
    console.log(info,tabs_Update);
    var port = connectPorts[`content-${id}`];
    //redirect & loading
    if(info.hasOwnProperty("url") && info.status === "loading"){
      tabs_Update[id] = true;
    }
    //complete
    if(info.status === 'complete' && tabs_Update[id]){
        delete tabs_Update[id];
        if(port){
          port.postMessage(new Message('tab_updated', {url:tab.url}));//postMessage
        }
    }
  }

  function connectHandler(port) {
    port.onMessage.addListener(messageHandler(port.name));
    port.onDisconnect.addListener(disconnectHandler);
    let portKey = `${port.name}-${port.sender.tab.id}`;
    if(!connectPorts.hasOwnProperty(portKey)){
      connectPorts[portKey] = port;
    }
    port.postMessage(new Message('res_connect', {url:port.sender.tab.url}));//postMessage
    /*---*/
    function disconnectHandler(port) {
      delete connectPorts[`${port.name}-${port.sender.tab.id}`];
    }

    function messageHandler(portName) {
      var fn = {
        "options": fn_options,
        "content": fn_content
      };

      return fn[portName];
      /*---*/
      function fn_options(msg, port) {

      }

      function fn_content(msg, port) {
        switch (msg.name) {
          case 'sell_form_exsist':
            var propArr = [
              {id:"chrome-carouseller-help-tool",title:`${chrome.i18n.getMessage("appName")}<${chrome.i18n.getMessage("versionName")}>`,contexts:["editable"],documentUrlPatterns:["https://tw.carousell.com/*"]},
              {parentId:"chrome-carouseller-help-tool",id:"sellFrom-ProductName-tags",title:"商品名稱標籤",contexts:["editable"],documentUrlPatterns:["https://tw.carousell.com/sell/"]},
              {parentId:"sellFrom-ProductName-tags",id:"productName-tags-0",title:"#含運最划算",contexts:["editable"],documentUrlPatterns:["https://tw.carousell.com/sell/"]},
              {parentId:"sellFrom-ProductName-tags",id:"productName-tags-1",title:"#交換最划算",contexts:["editable"],documentUrlPatterns:["https://tw.carousell.com/sell/"]},
            ];
            contextMenuBulider(propArr,()=>{
              port.postMessage(new Message('init_sell_form_tool', msg.data));//postMessage
            })

            break;
        }
      }
    }

  }

  function contextMenuBulider(propArr,donefn){
    let run = propArr.reduceRight(reducefn,donefn);
    run();
    function reducefn(fnChain,prop){
      return function (){
        chrome.contextMenus.create(prop,fnChain);
      }
    }
  }

})(chrome);
