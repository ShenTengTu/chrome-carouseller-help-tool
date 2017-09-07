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
          case 'req_executeScript':

            break;
        }
      }
    }

  }

})(chrome);
