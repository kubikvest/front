var kubikApp = angular.module('kubikApp', ['ngRoute', 'ui.router', 'timer'], function ($interpolateProvider) {
    $interpolateProvider.startSymbol('{|').endSymbol('|}');
});

kubikApp.config(function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
});

kubikApp.config([
    '$stateProvider',
    '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
        $stateProvider.state('promo', {
            url: "/",
            templateUrl: "view/index.html"
        })
        .state('task', {
            url: '/task',
            templateUrl: "view/task.html"
        }).state('checkpoint', {
            url: '/checkpoint',
            templateUrl: "view/checkpoint.html"
        }).state('finish', {
            url: '/finish',
            templateUrl: "view/finish.html"
        });
        $urlRouterProvider.otherwise('/');
    }
]);

kubikApp.controller('signupCtrl', ['$http', '$location', function ($http, $location) {
    this.activate = function () {
        if ($location.search().hasOwnProperty('code')) {
            this.code = true;
            var code = $location.search()['code'];
            $http.get('http://api.kubikvest.xyz/auth?code=' + code).then(function (res) {
                window.location = res.data.links.task;
            });

        }
    };
}]);

kubikApp.controller('taskCtrl', ['$http', '$location', '$scope', '$timeout', function ($http, $location, $scope, $timeout) {
    this.finish = false;
    this.$scope = $scope;
    this.task = {
        countdownVal: 0
    };

    this.getTask = function () {
        this.$scope.$broadcast('timer-reset');
        if ($location.search().hasOwnProperty('t')) {
            var token = $location.search()['t'];
            $http.get('http://api.kubikvest.xyz/task?t=' + token).then(function (res) {
                this.task = res.data;
                this.task.countdownVal = res.data.timer * 60;
                console.log(this.task);
                $timeout(function(){
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
            $http.get('http://api.kubikvest.xyz/checkpoint?t=' + token + '&c=' + lat + ',' + lng).then(function (res) {
                this.task = res.data;
                if (!this.task.finish) {
                    $location.path('task');
                } else {
                    this.finish = true;
                }
            }.bind(this));
        }
    };

    this.checkpoint = function () {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(this.onPositionUpdate.bind(this));
    };
}]);

kubikApp.controller('pointCtrl', ['$http', '$location', function ($http, $location) {
    this.onPositionUpdate = function (position) {
        var lat = position.coords.latitude;
        var lng = position.coords.longitude;

        if ($location.search().hasOwnProperty('t')) {
            var token = $location.search()['t'];
            $http.get('http://api.kubikvest.xyz/checkpoint?t=' + token + '&c=' + lat + ',' + lng).then(function (res) {
                this.task = res.data;
            }.bind(this));
        }
    };

    this.checkpoint = function () {
        if (navigator.geolocation) navigator.geolocation.getCurrentPosition(this.onPositionUpdate.bind(this));
    };
}]);
