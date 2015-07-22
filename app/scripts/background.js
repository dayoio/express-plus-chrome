'use strict';


var service, uncheck = [], msgs = [];

function autoCheck() {
    if (uncheck.length == 0) {
        console.log("auto finish");
        if (msgs.length > 0) {
            console.log("show notification");
            chrome.storage.sync.get({'check': true}, function (items) {
                for (var i = msgs.length - 1; i >= 0; i--) {
                    var m = msgs[i];
                    if (items.check && !m.check) {
                        msgs.splice(i, 1);
                        continue;
                    }
                    msgs[i] = {'title': m.id, 'message': m.text};
                }
                if(msgs.length == 0)
                {
                    console.log('not checked express.');
                }else {
                    chrome.notifications.create('update', {
                        type: 'list',
                        title: chrome.i18n.getMessage('notificationTitle'),
                        message: 'update',
                        iconUrl: 'images/icon-64.png',
                        items: msgs
                    }, function () {
                    });
                    msgs.length = 0;
                }
            })
        }
        return;
    }
    var id = uncheck.shift();
    var tmp_time = service.searchMark(id).value.time || undefined;
    service.updateMark(id).then(function (mark) {
        if (tmp_time !== undefined && tmp_time !== mark.time) {
            msgs.push(mark);
        }
        autoCheck();
    }, function () {
        autoCheck();
    });
}

function onInit() {
    onMessage();
}

function onAlarm(alarm) {
    if (alarm && alarm.name === 'auto') {
        if (!service)
            service = angular.injector(['explus', 'ng']).get('postsService');
        uncheck = service.getAllMarkId(true) || [];
        if (uncheck.length > 0) {
            msgs = [];
            autoCheck();
        }
    }
}

function onMessage() {
    chrome.storage.sync.get({'check': true, 'auto': true, 'delay': 30}, function (items) {
        if (items.auto) {
            console.log("check express after %s min", items.delay);
            chrome.alarms.create('auto', {'periodInMinutes': items.delay});
        } else {
            console.log("clear alarm");
            chrome.alarms.clear('auto');
        }
    })
}

/* listeners */
chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(onMessage);
