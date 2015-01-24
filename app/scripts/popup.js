'use strict';

/**
 * PopupApp Module
 * 彈出窗口模塊
 */

angular.module('popupApp', ['explus']).controller('MainController', function ($scope, postsService) {

    $scope.loading = false;

    //查詢方法
    $scope.query = function (id) {
        $scope.loading = true;
        $scope.post = {}
        $scope.marked = postsService.searchMark(id)
        postsService.getPost(id).then(postsService.update).then(
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

    $scope.mark = function (id) {
        $scope.marked = !$scope.marked;
        if($scope.marked)
            postsService.saveMark(id);
        else
            postsService.removeMark(id);
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
