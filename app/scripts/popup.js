'use strict';

/**
* PopupApp Module
* 彈出窗口模塊
*/

angular.module('popupApp', ['explus']).controller('MainController', function($scope, postsService){

    //狀態
    $scope.status = "init"
    $scope.Status = {
        "init": "init",
        "loading": "loading",
        "ready": "ready",
        "error": "error"
    }

    //查詢方法
    $scope.query = function(){
        $scope.status = "loading"

        postsService.getPost($scope.postId).then(function(post){
            $scope.post = post;
            $scope.status = 'ready';
        },function(error){
            $scope.status = 'error';
            console.log(error);
        })

        //$scope.subed = (optionsService.getSub($scope.postId).index !== -1);
        //if($scope.postId == undefined ) return;
        /*uery.query($scope.postId, function(d){
            console.log(d);
            if(d.status == "200")
            {
                $scope.status = 'ready';
                $scope.comCode = d.com;
                //
                var a = new Date(d.data[d.data.length-1].time)
                var b = new Date(d.data[0].time);
                $scope.pTime = (b.getTime()-a.getTime());
                $scope.result = d.data;
                $scope.ischeck = (d.ischeck === "1")
                $scope.nothing = false;
                if($scope.subed)
                {
                    var tmp = optionsService.getSub(d.nu);
                    if(tmp.index != -1 && tmp.value.last != d.data[0].time )
                    {
                        tmp.value.last = d.data[0].time;
                        tmp.value.text = d.data[0].context;
                        tmp.value.check = (d.ischeck === "1");
                        optionsService.addSub(tmp.value);
                    }
                }
            }
            else if(d.status == "201")
            {
                $scope.status = 'ready';
                $scope.comCode = d.com;
                $scope.result = {
                    "message": d.message
                }
                $scope.nothing = true;
            }
            else if( d.status == "400" || d.status == '500')
            {
                $scope.status = "error";
                $scope.result = d;
            }
        });*/
    };

    $scope.makerss = function(){
        /*var item = {
            "id": $scope.postId,
            "com": $scope.comCode,
            "last": !$scope.nothing ? $scope.result[0].time : "",
            "text": !$scope.nothing ? $scope.result[0].context : "",
            "check": $scope.ischeck,
            "tags": ""
        }
        $scope.subed = !$scope.subed;
        if($scope.subed == true)
        {
            optionsService.addSub(item);
        }else{
            optionsService.removeSub(item.id);
        }*/
    };

}).filter('spendTime', function(){
    return function(value){
        if(!value) "0天";
        value = Math.abs(value);

        var res = "";
        var hh = Math.floor(value/1000/60/60);
        if(hh>=24)
        {
            var dd = Math.floor(hh/24);
            hh -= dd*24;
            res = dd + '天';
        }
        res += hh + '小時';
        return res;
    }
})
