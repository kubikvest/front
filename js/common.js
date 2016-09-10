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

    /*this.checkpoint = function () {
        if (navigator.geolocation) {
            this.geolocation = true;
            navigator.geolocation.getCurrentPosition(
                this.onPositionUpdate.bind(this),
                function(error){
                    console.log('geolocation off');
                    this.geolocation = false;
                }.bind(this)
            );
        } else {
            console.log('geolocation off');
            this.geolocation = false;
        }
    };*/

    this.requestCurrentPosition = function(successCB, errorCB, timeoutCB, timeoutThreshold, options){
        var successHandler = successCB;
        var errorHandler = errorCB;
        window.geolocationTimeoutHandler = function(){
            timeoutCB();
        };
        if(typeof(geolocationRequestTimeoutHandler) != 'undefined'){
            clearTimeout(window['geolocationRequestTimeoutHandler']);
        }
        var timeout = timeoutThreshold || 30000;
        window['geolocationRequestTimeoutHandler'] = setTimeout('geolocationTimeoutHandler()', timeout);
        navigator.geolocation.getCurrentPosition(
            function(position){
                clearTimeout(window['geolocationRequestTimeoutHandler']);
                successHandler(position);
            },
            function(error){
                clearTimeout(window['geolocationRequestTimeoutHandler']);
                errorHandler(error);
            },
            options
        );
    };
    this.geolocation = true;
    this.geolocationErr = "";
    this.checkpoint = function () {
        this.requestCurrentPosition(
            this.onPositionUpdate.bind(this),
            function(error){
                if(error.PERMISSION_DENIED){
                    this.geolocationErr = "User denied access!";
                } else if(error.POSITION_UNAVAILABLE){
                    this.geolocationErr = "You must be hiding in Area 51!";
                } else if(error.TIMEOUT){
                    this.geolocationErr = "hmmm we timed out trying to find where you are hiding!";
                }
                console.log(this.geolocationErr);
                this.geolocation = false;
            }.bind(this), function() {
                this.geolocationErr = 'Hi there! we are trying to locate you but you have not answered the security question yet.\n\nPlease choose "Share My Location" to enable us to find you.';
                console.log(this.geolocationErr);
                this.geolocation = false;
            }.bind(this), 7000, {maximumAge:10000, timeout:0}).bind(this);
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
