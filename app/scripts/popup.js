'use strict';

/**
 * PopupApp Module
 * 彈出窗口模塊
 */

angular.module('popupApp', ['ui.bootstrap', 'explus'])
    .directive('ngRandomClass', function(){
        return {
            restrict: 'EA',
            replace: false,
            scope: {
                ngClasses: "="
            },
            link: function (scope, elem, attr) {
                elem.addClass(scope.ngClasses[Math.floor(Math.random() * (scope.ngClasses.length))]);
            }
        }
    })
    .controller('MainController', function ($scope, postsService) {

    $scope.postId = undefined;
    $scope.codes = [];

    $scope.$watch('postId', function(newVal, oldVal){
        console.log(newVal);
        if(newVal === undefined || newVal.length === 0){
            $scope.codes = [];
            $scope.post = {};
        }else {
            postsService.define(newVal).then(function (data) {
                $scope.codes = data;
                if ($scope.loading && $scope.codes.length > 0) {
                    updatePost($scope.postId, $scope.codes[0]);
                } else if ($scope.codes.length === 0) {
                    $scope.post = {'status': '400', 'message': "It's not a valid id."}
                }
            },function(error){
                $scope.post = error;
            })
        }
    })

    $scope.tagclasses = ['label-default','label-danger','label-info','label-primary', 'label-success', 'label-warning'];

    //查詢方法
    $scope.query = function (com) {
        $scope.loading = true;
        $scope.post = {}
        $scope.marked = postsService.searchMark($scope.postId)

        if(!com && $scope.codes.length > 0)
            com = $scope.codes[0];
        if(com){
            updatePost($scope.postId, com);
        }
    };

    var updatePost = function(id, com){
        postsService.update(id, com).then(function (post) {
            console.log(post);
            $scope.post = post;
            $scope.loading = false;
        }, function (error) {
            console.log(error);
            $scope.post = error;
            $scope.loading = false;
        });
    }

    $scope.mark = function () {
        $scope.marked = !$scope.marked;
        if($scope.marked)
            postsService.saveMark($scope.post);
        else
            postsService.removeMark($scope.post.id);
    };

}).filter('spendTime', function () {
    return function (value) {
        if (!value) "0 hour(s)";
        value = Math.abs(value);

        var res = "";
        var hh = Math.floor(value / 1000 / 60 / 60);
        if (hh >= 24) {
            var dd = Math.floor(hh / 24);
            hh -= dd * 24;
            res = dd + ' day(s) ';
        }
        res += hh + ' hour(s)';
        return res;
    }
})
