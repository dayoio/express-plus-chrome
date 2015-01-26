/**
 * Created by minos on 23/1/15.
 */
'use strict';

/*angular.element($window).on('storage', function(event) {
 if (event.key === 'my-storage') {
 $rootScope.$apply();
 }
 });*/


angular.module('explus', ['ngResource', 'ngStorage'])
    .factory('Post', function ($q) {

        var Post = function (id, com) {
            this.id = id;
            this.com = com;
        }
        Post.prototype = {
            setData: function (d) {
                angular.extend(this, d);
                /*this.check = (d['ischeck'] === '1')
                 this.steps = d['data'] || [];
                 this.status = d['status'];
                 */
                if (this.isOk()) {
                    var a = new Date(d.data[d.data.length - 1].time)
                    var b = new Date(d.data[0].time);
                    this.totaltime = (b.getTime() - a.getTime());
                }
            },
            toSimple: function () {
                var sp = {};
                sp.com = this.com;
                sp.text = this.data[0].context;
                sp.time = this.data[0].time;
                sp.check = (this.ischeck === '1');
                return sp;
            },
            isOk: function () {
                if (this.data && this.data.length > 0) {
                    return true;
                }
                return false;
            }
        }

        return Post;
    })
    .factory('postsService', function ($q, $resource, $window, $rootScope, $localStorage, Post) {
        var _Auto = $resource('http://www.kuaidi100.com/autonumber/auto?num=:postid', {postid: '@id'});
        var _Query = $resource('http://www.kuaidi100.com/query?type=:type&postid=:postid', {
            type: '@type',
            postid: '@id'
        });

        $rootScope.$storage = $localStorage.$default(
            {
                check: true,
                notification: true,
                auto: true,
                delay: 30,
                marks: {}
            });

        var postsService;
        postsService = {
            _posts: {},
            _retrieve: function (id, com) {
                var post = this._posts[id];
                if (post) {
                    post.com = com;
                } else {
                    post = new Post(id, com);
                    this._posts[id] = post;
                }
                return post;
            },
            _search: function (id) {
                return this._posts[id];
            },
            _define: function (id) {
                var scope = this;
                var defer = $q.defer();
                var post = this._search(id);
                if (post) {
                    console.log('define: cache');
                    defer.resolve(post);
                } else {
                    var mark = this.searchMark(id);
                    if(mark){
                        console.log('define: mark');
                        post = scope._retrieve(id, mark.com);
                        defer.resolve(post);
                    }else {
                        console.log('define: auto')
                        _Auto.query({postid: id}, function (data) {
                                console.log(data);
                                if (data.length > 0) {
                                    var post = scope._retrieve(id, data[0].comCode);
                                    return defer.resolve(post);
                                } else {
                                    return defer.reject({status: '400', message: 'Is not a valid post id.'});
                                }
                            },
                            function (error) {
                                defer.reject({status: '400', message: 'Is not a valid post id.', error: error});
                                return;
                            });
                    }
                }
                return defer.promise;
            },
            update: function (post) {
                console.log('update post');
                var defer = $q.defer();
                _Query.get({type: post.com, postid: post.id},
                    function (data) {
                        console.log('update complete');
                        if (data.data == undefined && data.data.length == 0){
                            post.message = 'Data not found!! Please try again later.'
                        }else{
                            delete post.message;
                        }
                        post.setData(data);
                        defer.resolve(post);
                    },
                    function (error) {
                        defer.reject({status: '400', message: '', error: error});
                    });
                return defer.promise;
            },
            getPost: function (id) {
                return this._define(id)
            },
            searchMark: function(id){
                return $rootScope.$storage.marks[id] || undefined;
            },
            saveMark: function (id) {
                var post = this._search(id);
                if(post){
                    if($rootScope.$storage.marks[id] === undefined)
                    {
                        $rootScope.$storage.marks[id] = post.toSimple();
                        return true;
                    }/*else{
                        delete $rootScope.$storage.marks[id];
                        return false;
                    }*/
                }
                return false;
            },
            removeMark: function (id) {
                delete $rootScope.$storage.marks[id];
            },
            updateMark: function(id) {
                var mark = this.searchMark(id);
                mark.loading = true;
                var post = this._retrieve(id, mark.com);
                var defer = $q.defer();
                this.update(post).then(function(post){
                    delete mark.loading;
                    try {
                        mark.text = post.data[0].context;
                        mark.time = post.data[0].time;
                        mark.check = (post.ischeck === '1');
                        defer.resolve(mark);
                    }catch (err){defer.reject(mark)}
                })
                return defer.promise;
            },
            getAllMarkId: function(uncheck){
                var ids = [];
                angular.forEach($rootScope.$storage.marks, function(key, val){
                    if(uncheck && val.check){
                        ids.push(key);
                    }else{
                        ids.push(key);
                    }
                });
                return ids;
            }
        }

        return postsService;
    })
