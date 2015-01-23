'use strict';


/**
 *
 */
var bgModule = angular.module('bgModule', ['expressService', 'optionsService']);

bgModule.controller('bgController', function($scope, Query, optionsService){
    var uncheck, msgs;

    /**
     * 獲取沒有收貨單號
     * @return {[type]} [description]
     */
    function update_uncheck()
    {
        uncheck = [];
        msgs = [];
        var subs = optionsService.getAllSubs();
        for(var i=0;i<subs.length;i++)
        {
            if(!subs[i].check){
                uncheck.push(subs[i]);
            }
        }
    }

    /**
     * 查詢
     * @param  {[type]} d [description]
     * @return {[type]}   [description]
     */
    function do_auto_query(d){
        if( d !== undefined && d.status == "200" )
        {
            var tmp = optionsService.getSub(d.nu);
            if( tmp.index != -1 ){
                if( d.ischeck == '1' || (optionsService.state('check') == false && d.data[0].time != tmp.value.last))
                {
                    tmp.value.check = (d.ischeck == '1');
                    tmp.value.last = d.data[0].time;
                    tmp.value.text = d.data[0].context;
                    optionsService.addSub(tmp.value);
                    msgs.push({title: tmp.value.id, message: tmp.value.text});
                }
            }
        }
        if(uncheck.length == 0)
        {
            console.log('query finished');
            if(optionsService.state('notification')=== true)
            {
                if(msgs.length >0){
                    chrome.notifications.create('subs-update',
                    {
                        'type': 'list',
                        'title': '快遞有更新',
                        'message': '更新內容',
                        'iconUrl': 'images/icon-128.png',
                        'items': msgs
                    }, function(id){})
                }
                chrome.alarms.create('auto', {periodInMinutes: optionsService.state('delay') });
            }
            return;
        }
        var u = uncheck.shift();
        Query.query(u.id, do_auto_query)
    }

    /**
     * chrome定時器
     * @param  {[type]} alarm [description]
     * @return {[type]}       [description]
     */
    function onAlarm(alarm){
        if( alarm && alarm.name == 'auto' )
        {
            console.log('start query');
            update_uncheck();
            do_auto_query();
        }
    }

    /**
     * 插件初始化
     * @return {[type]} [description]
     */
    function onInit(){
        console.log('installed');

        //啓動定時器
        chrome.alarms.create('auto', {periodInMinutes: optionsService.state('delay')});
    }

    //插件事件
    chrome.runtime.onInstalled.addListener(onInit);
    chrome.alarms.onAlarm.addListener(onAlarm);

    if (chrome.runtime && chrome.runtime.onStartup) {
        chrome.runtime.onStartup.addListener(function () {
            console.log('Starting browser....');
        });
    } else {
        chrome.windows.onCreated.addListener(function () {
            console.log('Window created....');
        });
    }

});


if( localStorage['du.first_run'] != "ok")
{
    console.log('set config');
    localStorage['du.first_run'] = "ok";
    localStorage['du.auto'] = true;
    localStorage['du.notification'] = true;
    localStorage['du.check'] = true;
    localStorage['du.delay'] = 30;
    localStorage['du.subs'] = [];
}