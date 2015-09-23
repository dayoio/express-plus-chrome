'use strict';

/**
 * ...
 */
angular.module('epOptionsApp', []).controller('OptionsController', function ($scope) {

    chrome.storage.sync.get({'sync': false, 'check': true, 'auto': true, 'delay': 30}, function (conf) {
        $scope.conf = conf;
        $scope.$apply();
    })

    $scope.i18n = function (msg) {
        return chrome.i18n.getMessage(msg);
    };

    $scope.delay_options = [1, 10, 20, 30, 60, 120];

    $scope.onChange = function (t) {
        if (t === 'auto') {
            chrome.storage.sync.set({'auto': $scope.conf.auto, 'delay': $scope.conf.delay}, function () {
                console.log("settings saved!");
                chrome.runtime.sendMessage({type: 'auto'});
            });
        }
        else if (t === 'check') {
            chrome.storage.sync.set({'check': $scope.conf.check}, function () {
                console.log("settings saved!");
            });
        }
        else if (t === 'sync') {
            chrome.storage.sync.set({'sync': $scope.conf.sync}, function () {
                chrome.runtime.sendMessage({type: 'sync'});
            });
        }
    }

});
