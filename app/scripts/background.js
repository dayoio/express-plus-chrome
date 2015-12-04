'use strict';

/*global angular chrome */
/*eslint no-unused-vars:1 no-console: 0*/

var service, marks = [], msgs = [];

function autoCheck() {
    if (marks.length == 0) {
        //console.log("auto finish");
        if (msgs.length > 0) {
            chrome.storage.sync.get({'check': true}, function (items) {
                for (var i = msgs.length - 1; i >= 0; i--) {
                    var m = msgs[i];
                    if (items.check && !m.check) {
                        msgs.splice(i, 1);
                        continue;
                    }
                    msgs[i] = {'title': m.id, 'message': m.text};
                }
                if (msgs.length != 0) {
                    chrome.notifications.create('update', {
                        type: 'list',
                        title: chrome.i18n.getMessage('notificationTitle'),
                        message: 'update',
                        iconUrl: 'images/icon-64.png',
                        items: msgs
                    }, function () {
                    });
                    chrome.browserAction.setBadgeText({text: '' + msgs.length});
                    msgs.length = 0;
                }
            });
        }
        return;
    }
    var id = marks.shift();
    var tmp = service.indexOf(id).value;
    var tmp_time = tmp.time || undefined;
    service.detail(id, tmp.com).then(function () {
        var mark = service.indexOf(id).value;
        if (mark && tmp_time !== undefined && tmp_time !== mark.time) {
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
            service = angular.injector(['epCore', 'ng']).get('epService');
        marks = service.getAll() || [];
        if (marks.length > 0) {
            msgs = [];
            autoCheck();
        }
    }
}

function onMessage(message) {
    if (message && message.type == 'copy') {
        // copy to clipboard
        var input = document.createElement('textarea');
        document.body.appendChild(input);
        input.value = message.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    } else {
        // alarm manage
        chrome.storage.sync.get({'sync': false, 'check': true, 'auto': true, 'delay': 30}, function (items) {
            if (items.auto) {
                console.log('check after %s min', items.delay);
                chrome.alarms.create('auto', {'periodInMinutes': items.delay});
            } else {
                console.log('clear alarm');
                chrome.alarms.clear('auto');
            }
        });
    }
}


/* listeners */
chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(onMessage);
