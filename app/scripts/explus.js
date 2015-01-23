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
    .factory('Post', function ($resource, $q) {
        var _Auto = $resource('http://www.kuaidi100.com/autonumber/auto?num=:postid', {postid: '@id'});
        var _Query = $resource('http://www.kuaidi100.com/query?type=:type&postid=:postid', {
            type: '@type',
            postid: '@id'
        });

        var Post = function (id) {
            this.id = id;
            this.com = null;
            this.text = '';
            this.totaltime = 0;
            this.check = false;
        }

        Post.prototype = {
            _setData: function (d) {
                this.check = (d['ischeck'] === '1')
                this.steps = d['data'];
                var a = new Date(d.data[d.data.length - 1].time)
                var b = new Date(d.data[0].time);
                this.totaltime = (b.getTime() - a.getTime());
            },
            _define: function () {
                var defer = $q.defer();
                if (this.com) {
                    defer.resolve(this.com);
                } else {
                    _Auto.query({postid: this.id},
                        function (data) {
                            if (data.length > 0) {
                                defer.resolve(data[0].comCode);
                            } else {
                                defer.reject();
                            }
                        },
                        function (error) {
                            defer.reject(error);
                        });
                }
                return defer.promise;
            },
            update: function () {
                var defer = $q.defer();
                var scope = this;
                console.log('start define');
                this._define().then(
                    function (com) {
                        console.log('define success: ' + com);
                        scope.com = com;
                        _Query.get({type: com, postid: scope.id},
                            function (data) {
                                scope._setData(data);
                                defer.resolve(scope);
                            },
                            function (error) {
                                defer.reject(error);
                            });
                    },
                    function (error) {
                        defer.reject(error);
                    }
                )
                return defer.promise;
            }
        }

        return Post;
    })
    .factory('postsService', function ($q, Post) {
        var postsService;

        postsService = {
            _posts: {},
            _search: function(id){
                return this._posts[id];
            },
            _load: function(id){

            },
            getPost: function(id){

            }
        }

        return postsService;
    })
