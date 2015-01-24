'use strict';

/**
* optionApp Module
*
* setting page
*/
angular.module('optionApp', ['explus']).controller('optionController', function($scope, postsService){

    $scope.delay_options = [10, 20, 30, 60];


    $scope.removeMark = function(id){
        postsService.removeMark(id);
    }

    $scope.updateMark = function(id){
        postsService.updateMark(id);
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
