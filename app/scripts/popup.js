'use strict';

/**
 * PopupApp Module
 * 彈出窗口模塊
 */

angular.module('popupApp', ['explus']).controller('MainController', function ($scope, postsService) {

    $scope.loading = false;

    //查詢方法
    $scope.query = function () {
        $scope.loading = true;
        $scope.post = {}
        postsService.getPost($scope.postId).then(postsService.update).then(
            function (post) {
                console.log(post);
                $scope.post = post;
                $scope.loading = false;
            }, function (error) {
                console.log(error);
                $scope.post = error;
                $scope.loading = false;
            })
    };

    $scope.mark = function () {

    };

}).filter('spendTime', function () {
    return function (value) {
        if (!value) "0天";
        value = Math.abs(value);

        var res = "";
        var hh = Math.floor(value / 1000 / 60 / 60);
        if (hh >= 24) {
            var dd = Math.floor(hh / 24);
            hh -= dd * 24;
            res = dd + '天';
        }
        res += hh + '小時';
        return res;
    }
})
