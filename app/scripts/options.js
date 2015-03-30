'use strict';

/**
 * optionApp Module
 *
 * setting page
 */
angular.module('optionApp', ['explus']).controller('optionController', function ($scope, postsService) {

    chrome.storage.sync.get({'check': true, 'auto': true, 'delay': 30}, function (conf) {
        $scope.conf = conf;
        $scope.$apply();
    })

    $scope.delay_options = [10, 20, 30, 60, 120];
    $scope.markFilter = '';

    $scope.removeMark = function (id) {
        postsService.removeMark(id);
    }

    $scope.updateMark = function (id) {
        postsService.updateMark(id).then(function (mark) {
        })
    }

    $scope.setFilter = function (f) {
        $scope.markFilter = f;
    }

    $scope.onChange = function (t) {
        if (t === 'auto')
            chrome.storage.sync.set({'auto': $scope.conf.auto, 'delay': $scope.conf.delay}, function () {
                console.log("settings saved!");
                chrome.runtime.sendMessage({});
            });
        else if (t === 'check')
            chrome.storage.sync.set({'check': $scope.conf.check}, function () {
                console.log("settings saved!");
            });
    }

}).filter('cut', function () {
    return function (value, max, tail) {
        if (!value) return ''

        if (value.length > max) {
            value = value.substr(0, max);
        }
        else {
            return value
        }
        return value + (tail || ' ...' );
    }
})
