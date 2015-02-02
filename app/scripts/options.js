'use strict';

/**
* optionApp Module
*
* setting page
*/
angular.module('optionApp', ['explus']).controller('optionController', function($scope, postsService){

    $scope.delay_options = [20, 30, 60, 120];

    $scope.removeMark = function(id){
        postsService.removeMark(id);
    }

    $scope.updateMark = function(id){
        postsService.updateMark(id).then(function (mark) {
        })
    }

    $scope.setFilter = function(f){
        $scope.markFilter = f;
    }

    $scope.onChange = function(t){
        var cmd;
        if(t === 'auto')
            cmd = {'act':'auto', 'value': $scope.$storage.auto, 'delay': $scope.$storage.delay };
        else if( t==='check' || t==='notification')
            cmd = {'act': t, 'value': $scope.$storage[t]};
        if(cmd)
            chrome.runtime.sendMessage(cmd);
    }

}).filter('cut', function(){
    return function(value, max, tail)
    {
        if(!value) return ''

        if(value.length > max )
        {
            value = value.substr(0, max);
        }
        else{
            return value
        }
        return value + (tail || ' ...' );
    }
})
