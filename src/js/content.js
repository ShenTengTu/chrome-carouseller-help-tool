"use strict";

import {Message} from './class/Message';


(function(chrome){
  var port = chrome.runtime.connect({ name: "content" });
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
      task_showProductPageId(l_pathname);
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



  /*var {
      hash:l_hash,
      host:l_host,
      hostname:l_hostname,
      href:l_href,
      origin:l_origin,
      pathname:l_pathname,
      port:l_port,
      protocol:l_protocol,
      search:l_search
  }= window.location;

  console.log(window.location);


  var inputElement = {
      input_ProductName:null,
      input_ProductPrice:null,
      input_StatusUsed:null,
      input_StatusNew:null,
      input_Meetup:null,
      input_Mailing:null,
      button_Location:null,
      textareas_Set2:null,
      textarea_Set3:null
  }

  if(l_host === "tw.carousell.com"){
      //sell page work
      if(/^\/sell\//g.test(l_pathname)){
          var sellForm = document.querySelector("div[data-reactroot]");
          var sellFormObserver = new MutationObserver(observeSellForm);
          sellFormObserver.observe( sellForm, {childList:true,subtree:true} );
          //window.addEventListener("click",(e)=>{console.dir(e.target)});

      }
      //get product page id
      if(/^\/p\//g.test(l_pathname)){
          var match = /-(\d+)\//g.exec(l_pathname);
          var div = document.createElement("div");
          div.innerText = match[1];
          div.style.position = "fixed";
          div.style.right = "8px";
          div.style.top = "58px";
          div.style.zIndex = "99999";
          div.style.padding = "8px";
          div.style.backgroundColor = "#f5bcbc";
          div.style.cursor = "pointer";
          div.addEventListener("click",(e)=>{
      	    selectText(e.target);
              document.execCommand('copy');
              removeSelect();
          });
          document.body.appendChild(div);
      }
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

  function observeSellForm(records,observer){
      //console.log(records);
      var ListingFieldSets = document.querySelectorAll("fieldset.ListingFieldSetGroup__group___1HHpj");
      if (ListingFieldSets.length === 4){
              inputElement.input_ProductName = ListingFieldSets[0].querySelector('input[type="text"]'),
              inputElement.input_ProductPrice = ListingFieldSets[0].querySelector('input[type="number"]'),
              inputElement.input_StatusUsed = ListingFieldSets[1].querySelector('input[type="radio"][id="1"]'),
              inputElement.input_StatusNew = ListingFieldSets[1].querySelector('input[type="radio"][id="2"]'),
              inputElement.input_Meetup = ListingFieldSets[2].querySelector('input[type="checkbox"][name="meetup"]'),
              inputElement.input_Mailing = ListingFieldSets[2].querySelector('input[type="checkbox"][name="mailing"]'),
              inputElement.button_Location = ListingFieldSets[2].querySelector('button.ListingFieldSetFields__pickerCell___vU1ue.ListingFormPickerCell__item___2WHe0'),
              inputElement.textareas_Set2 = ListingFieldSets[2].querySelectorAll('textarea'),
              inputElement.textarea_Set3 = ListingFieldSets[3].querySelector('textarea');
          console.log(inputElement);
          observer.disconnect();
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
