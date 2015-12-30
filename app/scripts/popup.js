'use strict';

/* global angular chrome */
/* eslint no-unused-vars: 0 */
/**
 * 彈出窗口
 */
 var coms = {
     'shunfeng': '顺丰',
     'zhaijisong': '宅急送',
     'zhongtong': '中通',
     'yuantong': '圆通',
     'yunda': '韵达',
     'shentong': '申通',
     'tiantian': '天天',
     'quanfengkuaidi': '全峰',
     'youshuwuliu': '优速',
     'jd': '京东',
     'neweggozzo': '新蛋',
     'xinbangwuliu': '新邦物流',
     'debangwuliu': '德邦物流',
     'huitongkuaidi': '百世汇通',
     'youzhengguonei': '国内邮政',
     'youzhengguoji': '邮政国际',
     'dhl': 'DHL(中国)',
     'dhlen': 'DHL(国际)',
     'dhlde': 'DHL(德国)',
     'ems': 'EMS',
     'emsguoji': 'EMS(国际)',
     'japanposten': 'EMS(日本)',
     'ecmsglobal': 'ECMS',
     'ecmscn': '易客满',
     'ups': 'UPS',
     'usps': 'USPS'
 };

angular.module('epApp', ['ngRoute', 'angularMoment', 'epCore'])
    .run(function (amMoment) {
        amMoment.changeLocale('zh-cn');
    })
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
            .when('/options', {
                controller: 'OptionsController',
                templateUrl: 'templates/options.html'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    // 标签随机样式
    .directive('ngRandomClass', function () {
        return {
            restrict: 'EA',
            replace: false,
            scope: {
                ngClasses: '='
            },
            link: function (scope, elem, attr) {
                elem.addClass(scope.ngClasses[Math.floor(Math.random() * (scope.ngClasses.length))]);
            }
        };
    })
    // 订阅列表
    .controller('ExpressListController', function ($scope, $rootScope, $location, $filter, epService) {

        $rootScope.post = null;

        // filter输入框不能放在ng-if内
        $scope.markFilter = '';
        $scope.setFilter = function (f) {
            $scope.markFilter = f;
        };

        $scope.removeMark = function (id) {
            //移除订阅
            epService.remove(id);
        };

        $scope.searchMark = function (id, type) {
            //更新当前快递
            $location.path('/detail').search({postId: id, type: type});
        };

        $scope.shareMark = function (id, type) {
            //拷贝信息到剪贴板
            chrome.runtime.sendMessage({
                type: 'copy',
                text: '单号: ' + id + '\n公司: ' + $filter('type2zh')(type)
            });
        };
    })
    // 查询结果
    .controller('ExpressDetailController', function ($scope, $rootScope, $location, epService) {
        var params = $location.search();

        // 查询页面清除当前post
        $rootScope.post = null;

        // 加载状态
        $scope.loading = true;
        // 查询
        epService.detail(params.postId, params.type).then(function (res) {
            $scope.loading = false;
            $rootScope.post = res;
        });

        // 设置订阅
        $scope.mark = function (b) {
            $scope.post.marked = b;
            if ($scope.post.marked) {
                epService.save($scope.post);
            } else {
                epService.remove($scope.post.id);
            }
        };

        // 刷新
        $scope.refresh = function () {
            $location.path('/detail').search({postId: params.postId, type: params.type, r: Math.random()});
        };
    })
    // 搜索
    .controller('MainController', function ($scope, $rootScope, $location, epService) {
        //点击图标时清除图标的数字
        chrome.browserAction.setBadgeText({text: ''});
        // label效果
        $rootScope.tagClasses = ['label-danger', 'label-info', 'label-primary', 'label-success', 'label-warning'];

        $scope.types = [];
        $scope.postId = '';

        $scope.$watch('postId', function (newVal, oldVal) {
            if (newVal == undefined || newVal.length == 0) {
                $scope.types = [];
            } else {
                epService.auto(newVal).then(function (res) {
                    $scope.types = res;
                });
            }
        });

        $scope.showDetail = function (type) {
            if (!type) type = $scope.types[0];
            $location.path('/detail').search({postId: $scope.postId, type: type, r: Math.random()});
        };

        $scope.goHome = function () {
            $location.path('/');
        };

        $scope.goOptions = function () {
            $location.path('/options');
        };
    })
    .controller('OptionsController', function ($scope) {

        chrome.storage.sync.get({'sync': false, 'check': true, 'auto': true, 'delay': 30}, function (conf) {
            $scope.conf = conf;
            $scope.$apply();
        });

        $scope.delay_options = [10, 20, 30, 60, 120];

        $scope.onChange = function (t) {
            if (t === 'auto') {
                chrome.storage.sync.set({'auto': $scope.conf.auto, 'delay': $scope.conf.delay}, function () {
                    chrome.runtime.sendMessage({type: 'auto'});
                });
            }
            else if (t === 'check') {
                chrome.storage.sync.set({'check': $scope.conf.check});
            }
            else if (t === 'sync') {
                chrome.storage.sync.set({'sync': $scope.conf.sync}, function (conf) {
                    chrome.runtime.sendMessage({type: 'sync'});
                });
            }
        };

    })
    // 快递类型转换
    .filter('type2zh', function () {
        return function (value) {
            if (value === undefined) value = '';
            return coms[value.toLowerCase()] || value;
        };
    });
