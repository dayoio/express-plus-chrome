'use strict';

/**
* optionApp Module
*
* setting page
*/
angular.module('optionApp', ['expressService', 'optionsService']).controller('optionController', function($scope, $window, Query, optionsService){

    $scope.subs = optionsService.getAllSubs();

    $scope.auto = optionsService.state('auto');
    $scope.check = optionsService.state('check');
    $scope.notification = optionsService.state('notification');

    $scope.delay_options = [10, 20, 30, 60];
    $scope.delay = optionsService.state('delay');

    $scope.saveOptions = function(){
        optionsService.state('notification', $scope.notification);
        optionsService.state('check', $scope.check);
        optionsService.state('auto', $scope.auto);
        optionsService.state('delay', $scope.delay);
    }

    $scope.removeSub = function(id){
        optionsService.removeSub(id);
    }

    $scope.doQuery = function(id){
        /*Query.query(id, function(d){
            if(d.status == "200")
            {
                var tmp = optionsService.getSub(d.nu);
                if( tmp.index != -1 ){
                    tmp.value.check = (d.ischeck == '1');
                    tmp.value.last = d.data[0].time;
                    tmp.value.text = d.data[0].context;
                    optionsService.addSub(tmp.value);
                }
            }
        });*/
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
