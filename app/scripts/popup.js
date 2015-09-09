'use strict';

/**
 * PopupApp Module
 * 彈出窗口模塊
 */

angular.module('epApp', ['ui.bootstrap', 'ngRoute', 'epCore'])
    //
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                controller: 'ExpressListController',
                templateUrl: 'templates/marks.html'
            })
            .when('/detail', {
                controller: 'ExpressDetailController',
                templateUrl: 'templates/detail.html'
            })
            .otherwise({
                redirectTo: '/'
            })
    })

    .directive('ngRandomClass', function () {
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
    //
    .controller('ExpressListController', function ($scope) {
        console.log('list');
    })
    //
    .controller('ExpressDetailController', function ($scope, $location, epService) {
        var params = $location.search();

        $scope.loading = true;
        epService.detail(params.postId, params.type).then(function(res){
            $scope.loading = false;
            $scope.post = res;
        });

    })
    //
    .controller('MainController', function ($scope, $location, epService) {
        //auto
        $scope.tagClasses = ['label-danger', 'label-info', 'label-primary', 'label-success', 'label-warning'];

        $scope.types = [];
        $scope.postId = '';

        $scope.$watch('postId', function (newVal, oldVal) {
            if (newVal.length == 0) {
                $scope.types = [];
            } else {
                //
                epService.auto(newVal).then(function (res) {
                    $scope.types = res;
                })
            }
        });

        $scope.showDetail = function (type) {
            if (!type) type = $scope.types[0];
            $location.path('/detail').search({postId: $scope.postId, type: type});
        }
    })

    .filter('cut', function () {
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
    //
    .filter('spendTime', function () {
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
    })
    //
    .filter('type2zh', function () {
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
            if (value === undefined) value = "";
            return coms[value.toLowerCase()] || value;
        }
    });
