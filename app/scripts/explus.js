/**
 * Created by minos on 23/1/15.
 */
'use strict';

/*angular.element($window).on('storage', function(event) {
 if (event.key === 'my-storage') {
 $rootScope.$apply();
 }
 });*/

angular.module('explus', ['ngResource'])
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
                if(d.data& d.data.length>0) {
                    var a = new Date(d.data[d.data.length - 1].time)
                    var b = new Date(d.data[0].time);
                    this.totaltime = (b.getTime() - a.getTime());
                }
            },
            toSimple: function(){
                var sp = {};
                sp.id = this.id;
                sp.com = this.com;
                sp.last = this.data[0].context;
                sp.time = this.data[0].time;
                sp.check = (this.ischeck === '1');
                return sp;
            }
        }

        return Post;
    })
    .factory('postsService', function ($q, $resource, $window, $rootScope, Post) {
        var postsService;
        var _Auto = $resource('http://www.kuaidi100.com/autonumber/auto?num=:postid', {postid: '@id'});
        var _Query = $resource('http://www.kuaidi100.com/query?type=:type&postid=:postid', {
            type: '@type',
            postid: '@id'
        });

        angular.element($window).on('storage', function(event){
           if(event.key === 'marks'){
               $rootScope.$apply();
           }
        });

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
                    defer.resolve(post);
                } else {
                    _Auto.query({postid: id}, function (data) {
                            console.log(data);
                            if (data.length > 0) {
                                var post = scope._retrieve(id, data[0].comCode);
                                return defer.resolve(post);
                            } else {
                                return defer.reject({status:'400', message:'Is not a valid post id.'});
                            }
                        },
                        function (error) {
                            defer.reject({status:'400', message: 'Is not a valid post id.', error: error});
                            return;
                        });
                }
                return defer.promise;
            },
            update: function (post) {
                var defer = $q.defer();
                _Query.get({type: post.com, postid: post.id},
                    function (data) {
                        post.setData(data);
                        if(!data.data) post.message = 'Data not found!! Please try again later.'
                        defer.resolve(post);
                    },
                    function (error) {
                        defer.reject({status:'400', message:'', error: error});
                    });
                return defer.promise;
            },
            getPost: function (id) {
                return this._define(id)
            },
            saveMark: function(id){
                var post = this._search(id);
                if(post){
                    //
                }else{

                }
            },
            removeMark: function(id){

            },
            getAllMarks: function(){

            }
        }

        return postsService;
    })
