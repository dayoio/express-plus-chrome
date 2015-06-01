'use strict';


angular.module('explus', ['ngResource', 'ngStorage'])
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
    .factory('Post', function () {

        var Post = function (id, com) {
            this.id = id;
            this.com = com;
        };
        Post.prototype = {
            setData: function (d) {
                angular.extend(this, d);
                if (this.isOk()) {
                    var a = new Date(d.data[d.data.length - 1].time);
                    var b = new Date(d.data[0].time);
                    this.totaltime = (b.getTime() - a.getTime());
                }
            },
            toSimple: function () {
                var sp = {};
                sp.id = this.id;
                sp.com = this.com;
                sp.text = this.data[0].context;
                sp.time = this.data[0].time;
                sp.check = (this.state === '3');
                sp.tags = this.tags || [];
                return sp;
            },
            isOk: function () {
                if (this.data && this.data.length > 0) {
                    return true;
                }
                return false;
            }
        };

        return Post;
    })
    .factory('localService', function () {
        var regs = {
            "ecmsglobal": /^APELAX[0-9]{7,12}/
        };
        return {
            check: function (id) {
                var res = null;
                for (var key in regs) {
                    if (id.match(regs[key])) {
                        res = [key];
                        break;
                    }
                }
                return res;
            }
        }
    })
    .factory('postsService', function ($q, $resource, $window, $rootScope, $localStorage, Post, localService) {
        var _Auto = $resource('http://www.kuaidi100.com/autonumber/auto?num=:postid', {postid: '@id'}, {timeout: 10000});
        var _Query = $resource('http://www.kuaidi100.com/query?type=:type&postid=:postid', {
            type: '@type',
            postid: '@id'
        }, {timeout: 10000});

        //初始配置
        $rootScope.$storage = $localStorage.$default(
            {
                check: true,
                notification: true,
                auto: true,
                delay: 30,
                marks: []
            });

        $rootScope.i18n = function (msg) {
            return chrome.i18n.getMessage(msg);
        };

        //单号状态
        var states = ['default', 'info', 'warning', 'success', 'danger', 'primary', 'warning']
        $rootScope.getStateClass = function ($first, $state) {
            return $first ? states[$state] : states[0];
        }

        $rootScope.tagclasses = ['label-danger', 'label-info', 'label-primary', 'label-success', 'label-warning'];

        var postsService;
        postsService = {
            define: function (id) {
                var defer = $q.defer();
                var mark = this.searchMark(id);
                if (mark.index !== -1) {
                    console.log('define: mark');
                    defer.resolve([mark.value.com]);
                } else {
                    console.log('define: auto');
                    var coms = localService.check(id);
                    if (coms) {
                        defer.resolve(coms);
                    } else {
                        _Auto.query({postid: id}, function (data) {
                                coms = data.length > 0 ? data.map(function (d) {
                                    return d.comCode;
                                }) : [];
                                return defer.resolve(coms);
                            },
                            function (error) {
                                return defer.reject({
                                    status: '400',
                                    message: 'Data not found!! Please try again later.'
                                });
                            });
                    }
                }
                return defer.promise;
            },
            update: function (id, com) {
                console.log('update ' + id + "@" + com);
                var defer = $q.defer();
                var scope = this;
                _Query.get({type: com, postid: id},
                    function (data) {
                        var post = new Post(id, com);
                        post.setData(data);
                        //add tags
                        var mark = scope.searchMark(id);
                        if (mark.index !== -1)
                            post.tags = mark.value.tags || [];
                        defer.resolve(post);
                    },
                    function () {
                        return defer.reject({
                            status: '400',
                            message: 'Data not found!! Please try again later.'
                        });
                    });
                return defer.promise;
            },
            //mark setting handler
            searchMark: function (id) {
                try {
                    for (var i = 0; i < $rootScope.$storage.marks.length; i++) {
                        if ($rootScope.$storage.marks[i].id === id)
                            return {index: i, value: $rootScope.$storage.marks[i]};
                    }
                } catch (err) {
                }
                return {index: -1};
            },
            saveMark: function (post) {
                if (post) {
                    //overwrite
                    var res = this.searchMark(post.id);
                    if (res.index !== -1) {
                        $rootScope.$storage.marks.splice(res.index, 1, post.toSimple());
                    }
                    else
                        $rootScope.$storage.marks.push(post.toSimple());
                }
            },
            removeMark: function (id) {
                var res = this.searchMark(id);
                if (res.index !== -1)
                    $rootScope.$storage.marks.splice(res.index, 1);
            },
            updateMark: function (id) {
                var defer = $q.defer();
                var mark = this.searchMark(id).value;
                mark.loading = true;
                this.update(id, mark.com).then(function (post) {
                    delete mark.loading;
                    try {
                        mark.text = post.data[0].context;
                        mark.time = post.data[0].time;
                        mark.check = (post.ischeck === '1');
                        defer.resolve(mark);
                    } catch (err) {
                        defer.reject(mark);
                    }
                });
                return defer.promise;
            },
            getAllMarkId: function (uncheck) {
                var ids = [];
                angular.forEach($rootScope.$storage.marks, function (val) {
                    if (uncheck && !val.check) {
                        ids.push(val.id);
                    } else if (!uncheck) {
                        ids.push(val.id);
                    }
                });
                return ids;
            }

        };

        return postsService;
    });
