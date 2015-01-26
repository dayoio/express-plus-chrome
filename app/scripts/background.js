'use strict';


var service, uncheck, notification=true, onlycheck=true, auto=true, delay=30,msgs;

function onInit(){
    service = angular.injector(['explus', 'ng']).get('postsService');
    chrome.alarms.create('auto', {'delayInMinutes':delay});
}

function onAlarm(alarm){
    //
    if( alarm && alarm.name == 'auto')
    {
        if(service)
        {
            uncheck = service.getAllMarkId(true) || [];
            msgs = [];
            autoCheck();
        }
    }
}

function autoCheck(){
    if(!uncheck || uncheck.length == 0 ){
        if(notification && msgs.length > 0)
        {
            var opt = {
                type: "list",
                title: "A new update",
                message: "A new update to display",
                iconUrl: "images/icon-38.png",
                items: msgs
            }
            chrome.notifications.create('update', opt, function(){
            });
        }
        return;
    }
    var id = uncheck.shift();
    var tmp_time = service.searchMark(id).time || undefined;
    service.updateMark(uncheck.shift()).then(function(mark){
        if( onlycheck && mark.check ){
            msgs.push({'id':mark.id, 'text':mark.text});
        }else if(!onlycheck){
            if(tmp_time!==undefined && tmp_time !== mark.time){
                msgs.push({'title':mark.id, 'message':mark.text});
            }
        }
        service.saveMark(mark.id);
        autoCheck();
    });
}

function onMessage(res){
    if(res.act == 'auto'){
        if(res.value === true){
            chrome.alarms.create('auto', {'delayInMinutes':res.delay});
        }else{
            chrome.alarms.clear('auto');
        }
    }else if(res.act =='notification')
    {
        notification = res.value;
    }else if(res.act =='check'){
        onlycheck = res.value;
    }
}

/* listeners */
chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(onMessage);
