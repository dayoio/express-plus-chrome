'use strict';

var service_app = angular.module('service', ['ngResource'])
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
            this.time = '';
            this.check = false;
        }

        Post.prototype = {
            _setData: function (data) {
            },
            define: function () {
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
            update: function (com) {
                var defer = $q.defer();
                com = com || this.com;
                if (com) {
                    var scope = this;
                    _Query.get({type: com, postid: this.id},
                        function (data) {
                            scope._setData(data);
                            defer.resolve(scope);
                        },
                        function (error) {
                            defer.reject(error);
                        });
                }else{
                    defer.reject();
                }
                return defer.promise;
            }
        }

        return Post;
    })
    .factory('service', function ($q, $window, Post) {

        var prefix = 'express.plus.';

        var service = {
            _posts: {},
            _create: function (id) {
                var post = this._search(id);
                if (!post){
                    post = new Post(id);
                    this._posts[id] = post;
                }
                return post;
            },
            _search: function (id) {
                return this._posts[id];
            },
            getPost: function (id) {
                var defer = $q.defer();
                var post = this._search(id);
                if (post) {
                    defer.resolve(post);
                } else {

                }
                return defer.promise;
            },
            state: function (name, value) {
                var getValue;
                if (arguments.length === 1) {
                    getValue = function (key) {
                        try {
                            return JSON.parse(localStorage[prefix + key]);
                        } catch (_error) {
                        }
                    };
                    if (Array.isArray(name)) {
                        return $q.when(name.map(getValue));
                    } else {
                        value = getValue(name);
                    }
                } else {
                    localStorage[prefix + name] = JSON.stringify(value);
                }
                return $q.when(value);
            }

        }

    });

angular.module('optionsService', []).factory('optionsService', function () {
    var optionsChangeCallback, optionsService, prefix, subs;

    optionsChangeCallback = [];
    prefix = 'du.';

    optionsService = {
        state: function (key, value) {
            if (arguments.length === 1) {
                try {
                    return JSON.parse(localStorage[prefix + key]);
                } catch (_error) {
                }
            } else {
                localStorage[prefix + key] = JSON.stringify(value);
                // optionsService.refresh(key, value);
            }
            return value;
        },
        /*addOptionsChangeCallback: function(callback) {
         return optionsChangeCallback.push(callback);
         },
         refresh: function(key, value) {
         var callback, _i, _len;
         for (_i = 0, _len = optionsChangeCallback.length; _i < _len; _i++) {
         callback = optionsChangeCallback[_i];
         callback(key, value);
         }
         },*/
        addSub: function (sub) {
            var tmp = optionsService.getSub(sub.id);
            if (tmp.index != -1) {
                subs.splice(tmp.index, 1, sub);
            } else {
                subs.push(sub);
            }
            optionsService.state('subs', subs);
        },
        removeSub: function (id) {
            var tmp = optionsService.getSub(id);
            if (tmp.index != -1) {
                subs.splice(tmp.index, 1);
                optionsService.state('subs', subs);
            }
        },
        getSub: function (id) {
            for (var i = 0; i < subs.length; i++) {
                if (subs[i].id == id) {
                    return {index: i, value: subs[i]};
                }
            }
            ;
            return {index: -1}
        },
        getAllSubs: function () {
            return subs;
        }
    }

    subs = optionsService.state('subs') || [];

    return optionsService;
});


angular.module('expressService', ['ngResource', 'optionsService']).factory('Query', function ($resource, optionsService) {
    var __Auto = $resource('http://www.kuaidi100.com/autonumber/auto?num=:postid', {postid: '@id'});
    var __Query = $resource('http://www.kuaidi100.com/query?type=:type&postid=:postid', {type: '@type', postid: '@id'});

    function do_query(type, postid, callback) {
        console.log('do query');
        __Query.get({type: type, postid: postid},
            function (data) {
                callback(data);
            },
            function (error) {
                callback(do_error("查詢超時..."))
            });
    };

    function do_auto(postid, callback) {
        console.log('do auto');
        __Auto.query({postid: postid},
            function (data) {
                if (data.length > 0) {
                    do_query(data[0].comCode, postid, callback)
                } else {
                    callback(do_error("不能識別快遞單號..."));
                }
            },
            function (error) {
                callback(do_error("不能識別快遞單號..."));
            });
    };

    function do_error(msg) {
        return {status: "400", "message": msg}
    };

    var Query = {
        query: function (id, callback) {
            var sub = optionsService.getSub(id)
            if (sub.index !== -1) {
                do_query(sub.value.com, id, callback);
            } else {
                do_auto(id, callback)
            }
        }
    };

    return Query;
});
