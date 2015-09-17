'use strict';

/**
 *
 */
angular.module('epCore', ['ngResource', 'ngStorage'])

    .service('Post', function () {

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

    .factory('localAuto', function ($rootScope) {
        var regs = {
            "ecmsglobal": /^APELAX[0-9]{7,12}/
        };
        return {
            query: function (id) {
                //
                try {
                    for (var i = 0; i < $rootScope.$storage.marks.length; i++) {
                        if ($rootScope.$storage.marks[i].id === id)
                            return [$rootScope.$storage.marks[i].com];
                    }
                } catch (err) {
                }
                //
                for (var key in regs) {
                    if (id.match(regs[key])) {
                        return [key];
                    }
                }
                return [];
            }
        }
    })

    .service('epAuto', function ($resource) {
        return $resource('http://www.kuaidi100.com/autonumber/auto?num=:postid', {}, {
            timeout: 10000
        })
    })

    .service('epQuery', function ($resource) {
        return $resource('http://www.kuaidi100.com/query?type=:type&postid=:postid', {}, {
            timeout: 10000
        });
    })

    .service('epService', function ($q, $resource, $rootScope, $localStorage, localAuto, epAuto, epQuery, Post) {

        $rootScope.$storage = $localStorage.$default(
            {
                marks: []
            });

        $rootScope.i18n = function (msg) {
            return chrome.i18n.getMessage(msg);
        };

        var self = this;

        //// 获取保存的列表
        //this.fetch = function () {
        //    return $rootScope.$storage.marks;
        //}

        // 保存
        this.save = function(post){
            if (post) {
                //overwrite
                var res = this.indexOf(post.id);
                if (res.index !== -1) {
                    $rootScope.$storage.marks.splice(res.index, 1, post.toSimple());
                }
                else
                    $rootScope.$storage.marks.push(post.toSimple());
            }
        }

        // 删除
        this.remove = function(postId){
            var mark = self.indexOf(postId);
            if (mark.index !== -1)
                $rootScope.$storage.marks.splice(mark.index, 1);
        }

        // 查找
        this.indexOf = function (postId) {
            try {
                for (var i = 0; i < $rootScope.$storage.marks.length; i++) {
                    if ($rootScope.$storage.marks[i].id === postId)
                        return {index: i, value: $rootScope.$storage.marks[i]};
                }
            } catch (err) {
            }
            return {index: -1};
        }

        // 识别
        this.auto = function (postId) {
            var defer = $q.defer();
            var types = localAuto.query(postId);
            if (types.length > 0) {
                defer.resolve(types);
            } else {
                epAuto.query({postid: postId}, function (res) {
                    types = res.length > 0 ? res.map(function(d){ return d.comCode; }) : [];
                    defer.resolve(types);
                }, function (err) {
                    defer.reject({
                        error: ''
                    })
                });
            }
            return defer.promise;
        }

        // 查询详细信息
        this.detail = function (postId, type) {
            var defer = $q.defer();

            epQuery.get({type: type, postid: postId}, function(res){
               var post = new Post(postId, type);
                post.setData(res);
                //

                defer.resolve(post);
            }, function(err){
                defer.reject({
                    error: ''
                })
            });

            return defer.promise;
        }

    });
