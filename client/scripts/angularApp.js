"use strict";
angular.module("nodeJWTApp", ["ngRoute", "AdalAngular"])
.config(["$routeProvider", "$httpProvider", "$locationProvider", "adalAuthenticationServiceProvider", function($routeProvider, $httpProvider, $locationProvider, adalProvider) {
  $routeProvider.when("/", {
    title: "home",
    controller: "homeController",
    templateUrl: "/views/home.tpl.html",
  }).when("/open", {
    title: "open",
    controller: "openController",
    templateUrl: "/views/open.tpl.html"
  }).when("/secure", {
    title: "secure",
    controller: "secureController",
    templateUrl: "/views/secure.tpl.html",
    requireADLogin: true,
  }).otherwise({
    title: "404",
    templateUrl: "/views/404.tpl.html"
  });

  // This will remove the # symbols from the url
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  }).hashPrefix("!");

  adalProvider.init({
    tenant: "<<tenantId>>",
    clientId: "<<clientId>>",
    // TODO: anonymousEndpoints won't be needed after adal-angular version 1.0.11
    anonymousEndpoints: []
  }, $httpProvider);
}])

.controller("HeaderController", ["$scope", "adalAuthenticationService", "$location", function($scope, adalService, $location) {
  $scope.login = function() {
    adalService.login();
  };
  $scope.logout = function() {
    adalService.logOut();
  };
}])

.controller("homeController", function($scope) {
})

.controller("openController", function($scope, dataService) {
  dataService.getOpenData()
  .then(function(results) {
    var results = results || {};
    $scope.data = results.data;
  });
})

.controller("secureController", function($scope, dataService) {
  dataService.getSecureData()
  .then(function(results) {
    var results = results || {};
    $scope.data = results.data;
  });
})

.factory("dataService", function($http) {
  return {
    getOpenData: function() {
      return $http.get("http://localhost:3000/data/open", {})
        .then(function(result) {
          return result;
        });
    },
    getSecureData: function() {
      return $http.get("http://localhost:3000/data/secure", {})
        .then(function(result) {
          return result;
        });
    }
  };
});
