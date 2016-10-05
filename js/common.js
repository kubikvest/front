var kubikApp = angular.module('kubikApp', ['ngRoute', 'ui.router', 'timer'], function ($interpolateProvider) {
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
        console.log(questId);
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
        this.finish = false;
        this.$scope = $scope;
        this.geolocationWork = true;
        this.geolocationErr = "";

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
                    console.log(this.task);
                    $timeout(function () {
                        this.$scope.$broadcast('timer-start');
                    }.bind(this));
                }.bind(this));
            }
        };

        this.onPositionUpdate = function (position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;

            if ($location.search().hasOwnProperty('t')) {
                var token = $location.search()['t'];
                $http.post('https://api.kubikvest.xyz/checkpoint', {
                    t: this.task.t,
                    lat: lat,
                    lng: lng
                }).then(function (res) {
                        this.task = res.data;
                        if (!this.task.finish) {
                            $location.path('task');
                        } else {
                            this.finish = true;
                        }
                    }.bind(this));
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
            navigator.geolocation.getCurrentPosition(
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
            console.log('go to checkpoint');
            this.requestCurrentPosition(
                this.onPositionUpdate.bind(this),
                function (error) {
                    console.log(error);
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            this.geolocationErr = "User denied access!";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            this.geolocationErr = "You must be hiding in Area 51!";
                            break;
                        case error.TIMEOUT:
                            this.geolocationErr = "hmmm we timed out trying to find where you are hiding!";
                            break;
                    }
                    this.geolocationWork = false;
                    $scope.$applyAsync();
                }.bind(this),
                function () {
                    var message = 'Hi there! we are trying to locate you but you have '
                        + 'not answered the security question yet.\n\n'
                        + 'Please choose "Share My Location" to enable us to find you.';
                    this.geolocationErr = message;
                    this.task.geolocationErr = message;
                    this.geolocationWork = false;
                    $scope.$applyAsync();
                }.bind(this),
                7000,
                {maximumAge: 10000, timeout: 0}
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
