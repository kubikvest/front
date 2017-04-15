var kubikApp = angular.module('kubikApp', ['ngRoute', 'ui.router', 'timer', 'ngSanitize'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{|').endSymbol('|}');
});

angular.element(document).ready(function () {
    angular.bootstrap(document, ['kubikApp']);
});

kubikApp.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
});

kubikApp.config(
    [
        '$stateProvider',
        '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {
            $stateProvider
                .state('promo', {
                    url: "/",
                    templateUrl: "view/index.html"
                })
                .state('list-quest', {
                    url: '/list-quest',
                    templateUrl: "view/list-quest.html"
                })
                .state('task', {
                    url: '/task',
                    templateUrl: "view/task.html"
                })
                .state('checkpoint', {
                    url: '/checkpoint',
                    templateUrl: "view/checkpoint.html"
                })
                .state('finish', {
                    url: '/finish',
                    templateUrl: "view/finish.html"
                });
            $urlRouterProvider.otherwise('/');
        }
    ]
);

kubikApp.controller('signupCtrl', [
    '$http', '$location', function ($http, $location) {
        this.activate = function () {
            if ($location.search().hasOwnProperty('code')) {
                this.code = true;
                var code = $location.search()['code'];
                $http.get('https://api.kubikvest.xyz/auth?code=' + code).then(function (res) {
                    if (res.data.links.list_quest) {
                        window.location = res.data.links.list_quest;
                    }
                    if (res.data.links.task) {
                        window.location = res.data.links.task;
                    }
                });

            }
        };
        this.clean = function () {
            $http.get('https://api.kubikvest.xyz/clean').then(function (res) {
                alert('Truncate db done');
            });
        };
    }
]);

kubikApp.controller('listQuestCtrl', ['$http', '$location', function ($http, $location) {
    this.quests = [];
    this.token = '';
    this.getListQuest = function () {
        if ($location.search().hasOwnProperty('t')) {
            var token = $location.search()['t'];
            $http.get('https://api.kubikvest.xyz/list-quest?t=' + token).then(function (res) {
                this.quests = res.data.quests;
                this.token  = res.data.t;
            }.bind(this));
        }
    };
    this.changeQuest = function (questId) {
        $http.post('https://api.kubikvest.xyz/create-game', {
            t: this.token,
            quest_id: questId
        }).then(function (res) {
            window.location = res.data.links.task;
        }.bind(this));
    };
}]);

kubikApp.controller('taskCtrl', [
    '$http', '$location', '$scope', '$timeout', function ($http, $location, $scope, $timeout) {
        console.log('version=5');
        this.finish = false;
        this.isLoaded = false;
        this.$scope = $scope;
        this.geolocationWork = true;
        this.geolocation = {};
        this.geolocationErr = "";
        this.checkoutAttempt = 0;
        this.geolocationId = null;
        this.minutes = 0;
        this.seconds = 0;
        this.notify = {
            msg: "",
            type: "success"
        };
        this.task = {
            countdownVal: 0
        };

        this.getTask = function () {
            this.$scope.$broadcast('timer-reset');
            if ($location.search().hasOwnProperty('t')) {
                var token = $location.search()['t'];
                $http.get('https://api.kubikvest.xyz/task?t=' + token).then(function (res) {
                    this.task = res.data;
                    this.task.countdownVal = res.data.timer;
                    console.log("countdownVal", this.task.countdownVal);
                    $timeout(function () {
                        this.$scope.$broadcast('timer-start');
                    }.bind(this));
                }.bind(this));
            }
        };

        this.onPositionUpdate = function (position) {
            //var lat = position.coords.latitude;
            //var lng = position.coords.longitude;
            var acr = 39;//position.coords.accuracy;
            var lat = position[0];
            var lng = position[1];

            console.info("lat", lat, "lng", lng);

            if ($location.search().hasOwnProperty('t')) {
                var token = $location.search()['t'];
                $http.post('https://api.kubikvest.xyz/checkpoint', {
                    t: this.task.t,
                    lat: lat,
                    lng: lng,
                    acr: acr
                }).then(function (res) {
                    console.log("Success checkout");
                    /*if ((!res.error && typeof res.error === 'undefined') || this.checkoutAttempt <= 0) {
                        //navigator.geolocation.clearWatch(this.geolocationId);
                        this.checkoutAttempt = 0;
                    } else {
                        this.checkoutAttempt--;
                    }*/


                    /*this.task = res.data;
                    this.isLoaded = false;
                    if (!this.task.finish) {
                        this.getTask();
                        //$location.path('task');
                    } else {
                        this.finish = true;
                    }*/
                }, function (res) {
                    if (res.data) {
                        this.notify = res.data.error;
                        this.type = 'alert';
                    } else {
                        var msg = "Что-то пошло не так :(";
                        if (res.status >= 500) {
                            msg = "Нет связи с сервером :(";
                        }
                        this.notify = {
                            msg: msg,
                            typ: 'alert'
                        };
                    }
                    this.isLoaded = false;
                }.bind(this));
            }
        };

        this.sleep = function (ms) {
            ms += new Date().getTime();
            while (new Date() < ms){}
        };

        this.onPositionUpdate2 = function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var acr = position.coords.accuracy;

            console.info("lat", lat, "lng", lng, "acr", acr);

            if ($location.search().hasOwnProperty('t')) {
                var token = $location.search()['t'];
                console.info(this.task);
                $http.post('https://api.kubikvest.xyz/checkpoint', {
                    t: this.task.t,
                    lat: lat,
                    lng: lng,
                    acr: acr,
                    att: this.checkoutAttempt,
                    title: this.task.point.title,
                    point: this.point_id,
                    pointid: this.task.point.pointId,
                    point_id: this.task.point.pointId
                }).then(function (res) {
                    this.notify = {
                        msg: 'Отлично!',
                        type: 'success'
                    };
                    this.checkoutAttempt = 0;
                    this.downCheckoutAttempt();
                    this.task = res.data;
                    this.point_id = this.task.point.point_id;
                    if (!this.task.finish) {
                        this.getTask();
                     //$location.path('task');
                    } else {
                        this.finish = true;
                    }
                }.bind(this), function (res) {
                    this.downCheckoutAttempt();
                    if (res.data) {
                        this.notify = res.data.error;
                        this.type = 'alert';
                    } else {
                        var msg = "Что-то пошло не так :(";
                        if (res.status >= 500) {
                            msg = "Нет связи с сервером :(";
                        }
                        this.notify = {
                            msg: msg,
                            type: 'alert'
                        };
                    }
                }.bind(this));
            }
        };

        this.downCheckoutAttempt = function () {
            if (this.checkoutAttempt <= 0) {
                navigator.geolocation.clearWatch(this.geolocationId);
                this.isLoaded = false;
                this.notify = {};
                this.checkoutAttempt = 0;
            } else {
                this.checkoutAttempt--;
            }
        };

        this.requestCurrentPosition = function (successHandler, errorHandler, timeoutCB, timeoutThreshold) {
            window.geolocationTimeoutHandler = function () {
                timeoutCB();
            };
            if (typeof(geolocationRequestTimeoutHandler) != 'undefined') {
                clearTimeout(window['geolocationRequestTimeoutHandler']);
            }
            var timeout = timeoutThreshold || 30000;
            window['geolocationRequestTimeoutHandler'] = setTimeout('geolocationTimeoutHandler()', timeout);
            this.geolocationId = navigator.geolocation.watchPosition(
                function (position) {
                    clearTimeout(window['geolocationRequestTimeoutHandler']);
                    successHandler(position);
                },
                function (error) {
                    clearTimeout(window['geolocationRequestTimeoutHandler']);
                    errorHandler(error);
                }
            );
        };

        this.checkpoint = function () {
            this.notify = {};
            this.checkoutAttempt = 3;

            //var geolocation = ymaps.geolocation;
            this.isLoaded = true;

            /*geolocation.get({
                provider: 'browser',
                mapStateAutoApply: true
            }).then(function (res) {
                return res.geoObjects.get(0).geometry.getCoordinates();
            }).then(function(res){
                this.onPositionUpdate(res);
            }.bind(this));
            this.isLoaded = false;*/

            this.requestCurrentPosition(
                this.onPositionUpdate2.bind(this),
                function (error) {
                    this.notify.type = 'alert';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            this.notify.msg = "Вы нарочно запретили доступ к GPS :( 😉";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            this.notify.msg = "Вы точно на пленете земля? 🚀";
                            break;
                        case error.TIMEOUT:
                            this.notify.msg = "Мне вас не найти :(";
                            break;
                    }
                    this.geolocationWork = false;
                    this.isLoaded = false;
                    $scope.$applyAsync();
                }.bind(this),
                function () {
                    this.notify.msg = "Нет доступа к GPS :(";
                    this.notify.type = 'alert';
                    this.geolocationWork = false;
                    this.isLoaded = false;
                    $scope.$applyAsync();
                }.bind(this),
                7000
            );

        };

        this.getFinish = function () {
            if ($location.search().hasOwnProperty('t')) {
                var token = $location.search()['t'];
                $http.get('https://api.kubikvest.xyz/finish?t=' + token)
                    .then(function (res) {
                        this.task = res.data;
                    }.bind(this));
            }
        };
    }
]);
