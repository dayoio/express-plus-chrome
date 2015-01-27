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

        $rootScope.i18n = function(msg){
            return chrome.i18n.getMessage(msg);
        }

        var postsService;
        postsService = {
            /*_posts: {},
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
            },*/
            define: function (id) {
                var defer = $q.defer();
                var mark = this.searchMark(id);
                if(mark){
                    console.log('define: mark');
                    defer.resolve([mark.com]);
                }else {
                    console.log('define: auto')
                    _Auto.query({postid: id}, function (data) {
                            var coms = data.length>0?data.map(function(d){return d.comCode;}):[];
                            return defer.resolve(coms);
                        },
                        function (error) {
                            defer.reject({status: '400', message: 'Is not a valid post id.', error: error});
                            return;
                        });
                }
                return defer.promise;
            },
            update: function (id, com) {
                console.log('update post');
                var defer = $q.defer();
                _Query.get({type: com, postid: id},
                    function (data) {
                        console.log('update complete');
                        var post = new Post(id, com);
                        if (data.data == undefined || data.data.length == 0){
                            post.message = 'Data not found!! Please try again later.'
                        }else{
                            delete post.message;
                        }
                        post.setData(data);
                        defer.resolve(post);
                    },
                    function (error) {
                        defer.reject({status: '400', message: 'Data not found!! Please try again later.', error: error});
                    });
                return defer.promise;
            },
            searchMark: function(id){
                return $rootScope.$storage.marks[id] || undefined;
            },
            saveMark: function (post) {
                if(post){
                    if($rootScope.$storage.marks[post.id] === undefined)
                    {
                        $rootScope.$storage.marks[post.id] = post.toSimple();
                        return true;
                    }
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
