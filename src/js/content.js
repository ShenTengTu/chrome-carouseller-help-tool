"use strict";

import {Message} from './class/Message';

var $ = require('jquery');
require('jquery-sendkeys');

(function(chrome){
  var port = chrome.runtime.connect({ name: "content" });
  var onContextmenuEl;
  port.onMessage.addListener(messageHandler);
  function messageHandler(msg) {
    switch (msg.name) {
      case "res_connect":
        console.log("res_connect",msg.data.url);
        if(performance.navigation.type === 1){//if Location.reload()
          assignTask(window.location,port);
        }
        break;
      case "tab_updated":
        console.log("tab_updated",msg.data.url);
        assignTask(window.location,port);
        break;
      case "init_sell_form_tool":
        console.log("init_sell_form_tool",msg.data);
        initSellFormTool(msg.data);
        break;
      case "execute_contextmenu":
        //Must simulate keypress to input text
        //becuase it is react component,value attribute is just a getter
        $(onContextmenuEl).sendkeys(msg.data.tag);
        break;
    }
  }

  function assignTask(location,port){
    console.log(location);
    var {
        hash:l_hash,
        host:l_host,
        hostname:l_hostname,
        href:l_href,
        origin:l_origin,
        pathname:l_pathname,
        port:l_port,
        protocol:l_protocol,
        search:l_search
    }= location;

    if(l_host === "tw.carousell.com"){
      //get product page id
      window.addEventListener("contextmenu",function(e){
        onContextmenuEl = e.target;
        console.log(e);
      })
      task_showProductPageId(l_pathname);
      task_observeSellForm(l_pathname);
    }

    function task_showProductPageId(pathname){
      let bool = /^\/p\//g.test(pathname);
      let match = /-(\d+)\//g.exec(pathname);
      if(bool){
        let parent = document.querySelector('ol[typeof="BreadcrumbList"]');
        let temp_div = document.createElement("div");
        let target_id = "carousell-product-page-id";
        temp_div.innerHTML =`<li class="tw-carouseller-tool" id="${target_id}"><span>${match[1]}</span></li>`;
        while(temp_div.children.length >0){
          temp_div.children[0].querySelector('span').addEventListener("click",(e)=>{
            selectText(e.target);
              document.execCommand('copy');
              removeSelect();
          });
          parent.appendChild(temp_div.children[0]);
          parent.lastChild.previousSibling.style.display = "inline-block";
        }
      }
    }

    function task_observeSellForm(pathname){
      let bool = /^\/sell\//g.test(pathname);
      if(bool){
        let sellForm = document.querySelector("div[data-reactroot]");
        let sellFormObserver = new MutationObserver(observe);
        sellFormObserver.observe( sellForm, {childList:true,subtree:true} );
      }

      function observe(records, observer) {
        var ListingFieldSets = document.querySelectorAll("fieldset.ListingFieldSetGroup__group___1HHpj");
        if (ListingFieldSets.length === 4) {
          let input_ProductName = ListingFieldSets[0].querySelector('input[type="text"]');
          let input_ProductPrice = ListingFieldSets[0].querySelector('input[type="number"]');
          let input_StatusUsed = ListingFieldSets[1].querySelector('input[type="radio"][id="1"]');
          let input_StatusNew = ListingFieldSets[1].querySelector('input[type="radio"][id="2"]');
          let input_Meetup = ListingFieldSets[2].querySelector('input[type="checkbox"][name="meetup"]');
          let input_Mailing = ListingFieldSets[2].querySelector('input[type="checkbox"][name="mailing"]');
          let button_Location = ListingFieldSets[2].querySelector('button.ListingFieldSetFields__pickerCell___vU1ue.ListingFormPickerCell__item___2WHe0');
          button_Location.id = "seller-location";
          let textareas_Set2 = ListingFieldSets[2].querySelectorAll('textarea');
          let textarea_Set3 = ListingFieldSets[3].querySelector('textarea');
          let elementsID = {
            productName: input_ProductName.id,
            productPrice: input_ProductPrice.id,
            statusUsed: input_StatusUsed.id,
            statusNew: input_StatusNew.id,
            meetup: input_Meetup.id,
            mailing: input_Mailing.id,
            location: button_Location.id,
            meetupContent: textareas_Set2[0].id,
            mailingContent: textareas_Set2[1].id,
            productContent: textarea_Set3.id
          }
          port.postMessage(new Message('sell_form_exsist', elementsID));//postMessage
          observer.disconnect();
        }
      }

    }

  }

  function initSellFormTool(elementsID){
    let {
      productName: id_productName,
      productPrice: id_productPrice,
      statusUsed: id_statusUsed,
      statusNew: id_statusNew,
      meetup: id_meetup,
      mailing: id_mailing,
      location: id_location,
      meetupContent: id_meetupContent,
      mailingContent: id_mailingContent,
      productContent: id_productContent
    } = elementsID;
  }

  function selectText(el) {
      if (document.selection) {
          var range = document.body.createTextRange();
          range.moveToElementText(el);
          range.select();
      } else if (window.getSelection) {
          var range = document.createRange();
          range.selectNode(el);
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
      }
  }

  function removeSelect(){
    if (window.getSelection) {
      if (window.getSelection().empty) {  // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {  // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {  // IE?
      document.selection.empty();
    }
  }

  function getElementPosition(el) {
    var pos = {
      x: 0,
      y: 0
    };
    while (el) {
      pos.x += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      pos.y += (el.offsetTop - el.scrollTop + el.clientTop);
      el = el.offsetParent;
    }
    return pos;
  }



  /*

  if(l_host === "tw.carousell.com"){

      //get all category
      if(l_pathname === "/"){
          let li = document.querySelectorAll('.MenuItem__menuItem___2Cf8J');
          let obj = {};
          let temp;
          li.forEach((e)=>{
          let anchor = e.querySelector('a');
          let regex = /\d+/g;
          let m;
          temp = [];
          while ((m = regex.exec(anchor.href)) !== null) {

              // This is necessary to avoid infinite loops with zero-width matches
              if (m.index === regex.lastIndex) {
                  regex.lastIndex++;
              }

              // The result can be accessed through the `m`-variable.
              m.forEach((match, groupIndex) => {
                  temp.push(match);
              });
          }
              temp.reverse();
              temp.forEach((currKey,i)=>{
                  let parentKey =  temp[i+1];
                  let subKey = temp[i-1];
                  if(!obj.hasOwnProperty(currKey)){
                      obj[currKey] = {};
                      obj[currKey].name = anchor.innerText;
                      obj[currKey].sub = [];
                  }
                  if(subKey && !obj.hasOwnProperty(subKey)){
                      obj[subKey] = {};
                      obj[subKey].sub = [];
                  }
                  obj[currKey].parent = parentKey?parentKey:null;
                  if(subKey && !obj[currKey].sub.includes(subKey)){
                      obj[currKey].sub.push(subKey)
                  }
              })
          });

          //
          var button = document.createElement("button");
          button.innerText = "Post category json";
          button.style.position = "fixed";
          button.style.right = "8px";
          button.style.top = "58px";
          button.style.zIndex = "99999";
          button.addEventListener("click",doPost);
          document.body.appendChild(button);
      }

  }







  function doPost(){
      let json = JSON.stringify(obj);
      console.log(obj);
      for(let k in obj){
          if(obj[k].parent){
              if(parseInt(k) <parseInt(obj[k].parent)){
                  console.log(k);
              }
          }

      }
  }



  /*------------------*/

})(chrome);
