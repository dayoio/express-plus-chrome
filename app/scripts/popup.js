'use strict';

/**
 * PopupApp Module
 * 彈出窗口模塊
 */

angular.module('popupApp', ['ui.bootstrap', 'explus', 'ngRoute'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/save', {
                templateUrl: 'mark.html'
            })
            .otherwise({
                templateUrl: 'result.html'
            })
    })

    .controller('MainController', function ($scope, $location, postsService) {


        $scope.postId = undefined;
        $scope.undefined = false;
        $scope.codes = [];
        $scope.testTag = [];

        $scope.$watch('postId', function (newVal, oldVal) {
            console.log(newVal);
            if (newVal === undefined || newVal.length === 0) {
                $scope.codes = [];
                $scope.post = {};
            } else {
                $scope.undefined = true;
                postsService.define(newVal).then(function (data) {
                    $scope.codes = data;
                    $scope.undefined = false;
                    if ($scope.loading && $scope.codes.length > 0) {
                        $scope.post = {};
                        updatePost($scope.postId, $scope.codes[0]);
                    } else if ($scope.codes.length === 0) {
                        $scope.post = {'status': '400', 'message': "请输入正确的快递单号..."}
                    }
                }, function (error) {
                    $scope.post = error;
                })
            }
        })


        //查詢方法
        $scope.query = function (com) {
            $scope.loading = true;
            $scope.post = {}
            $scope.marked = (postsService.searchMark($scope.postId).index !== -1);

            if (!com && $scope.codes.length > 0)
                com = $scope.codes[0];
            if (com) {
                updatePost($scope.postId, com);
            }
        };

        var updatePost = function (id, com) {
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

        $scope.mark = function (b) {
            $scope.marked = b;
            if(b)
                postsService.saveMark($scope.post);
            else
                postsService.removeMark($scope.post.id);
            $location.path('#/');
        };

    }).filter('spendTime', function () {
        return function (value) {
            if (!value) "0 小时";
            value = Math.abs(value);

            var res = "";
            var hh = Math.floor(value / 1000 / 60 / 60);
            if (hh >= 24) {
                var dd = Math.floor(hh / 24);
                hh -= dd * 24;
                res = dd + ' 天 ';
            }
            res += hh + ' 小时';
            return res;
        }
    }).filter('code2zh', function () {
        var coms = {
            "shunfeng": "顺丰",
            "zhaijisong": "宅急送",
            "zhongtong": "中通",
            "yuantong": "圆通",
            "yunda": "韵达",
            "shentong": "申通",
            "tiantian": "天天",
            "quanfengkuaidi": "全峰",
            "youshuwuliu": "优速",
            "jd": "京东",
            "neweggozzo": "新蛋",
            "xinbangwuliu": "新邦物流",
            "debangwuliu": "德邦物流",
            "huitongkuaidi": "百世汇通",
            "youzhengguonei": "国内邮政",
            "youzhengguoji": "邮政国际",
            "dhl": "DHL(中国)",
            "dhlen": "DHL(国际)",
            "dhlde": "DHL(德国)",
            "ems": "EMS",
            "emsguoji": "EMS(国际)",
            "japanposten": "EMS(日本)",
            "ecmsglobal": "ECMS",
            "ups": "UPS",
            "usps": "USPS"
        }
        return function (value) {
            return coms[value.toLowerCase()]||value;
        }
    });
