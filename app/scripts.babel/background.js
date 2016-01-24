'use strict';

/*eslint no-unused-vars:1 no-console: 0*/

var service, marks = [],
  msgs = [];

function autoCheck() {
  if (marks.length === 0) {
    //console.log("auto finish");
    if (msgs.length > 0) {
      chrome.storage.sync.get({
        'check': true
      }, function(items) {
        for (var i = msgs.length - 1; i >= 0; i--) {
          var m = msgs[i];
          if (items.check && !m.check) {
            msgs.splice(i, 1);
            continue;
          }
          var title;
          if (m.tags.length > 0) {
            title = '(' + m.tags[0] + ') ' + m.id;
          } else {
            title = m.id;
          }
          msgs[i] = {
            'title': title,
            'message': m.text
          };
        }
        if (msgs.length !== 0) {
          chrome.notifications.create('update', {
            type: 'list',
            title: chrome.i18n.getMessage('notificationTitle'),
            message: 'update',
            iconUrl: 'images/icon-64.png',
            items: msgs
          }, function() {});
          chrome.browserAction.setBadgeText({
            text: '' + msgs.length
          });
          msgs.length = 0;
        }
      });
    }
    return;
  }
  var id = marks.shift();
  var tmp = service.indexOf(id).value;
  var tmpTime = tmp.time || undefined;
  service.detail(id, tmp.com).then(function() {
    var mark = service.indexOf(id).value;
    if (mark && tmpTime !== undefined && tmpTime !== mark.time) {
      msgs.push(mark);
    }
    autoCheck();
  }, function() {
    autoCheck();
  });
}


function onAlarm(alarm) {
  if (alarm && alarm.name === 'auto') {
    if (!service) {
      service = angular.injector(['epCore', 'ng']).get('epService');
    }
    marks = service.getAll() || [];
    if (marks.length > 0) {
      msgs = [];
      autoCheck();
    }
  }
}

function onMessage(message) {
  if (message && message.type === 'copy') {
    // copy to clipboard
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = message.text;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
  } else if (message && message.type === 'sync') {
    chrome.storage.sync.get({
      'sync': false
    }, function(items) {
      if (items.sync) {
        // load
      }
    });
  } else if (message && message.type === 'auth') {
    //
  } else {
    // alarm manage
    chrome.storage.sync.get({
      'sync': false,
      'check': true,
      'auto': true,
      'delay': 30
    }, function(items) {
      if (items.auto) {
        console.log('check after %s min', items.delay);
        chrome.alarms.create('auto', {
          'periodInMinutes': items.delay
        });
      } else {
        console.log('clear alarm');
        chrome.alarms.clear('auto');
      }
    });
  }
}

function onBeforeSendHeaders(details) {
  for (var i = 0; i < details.requestHeaders.length; i++) {
    if (details.requestHeaders[i].name === 'Referer') {
      details.requestHeaders.splice(i, 1);
    }
  }
  details.requestHeaders.push({
    name: 'Referer',
    value: 'http://www.kuaidi100.com/'
  });
  return {
    requestHeaders: details.requestHeaders
  };
}

function onInit() {
  onMessage();
}

/* listeners */
chrome.runtime.onInstalled.addListener(onInit);
chrome.alarms.onAlarm.addListener(onAlarm);
chrome.runtime.onMessage.addListener(onMessage);
chrome.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, {
  urls: ['http://www.kuaidi100.com/*']
}, ['requestHeaders', 'blocking']);
