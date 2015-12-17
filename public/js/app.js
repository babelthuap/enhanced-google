'use strict';

var app = angular.module('searchApp', []);

app.controller('MainCtrl', function($scope, $http) {
  $scope.results = [
    {title: 'XKCD', url: 'xkcd.com'},
    {title: 'Bob', url: 'bob.com'}
  ];

  $scope.search = function(query) {
    $http.get('/search/' + query)
    .then(res => $scope.results = res.data,
          err => console.log(err))
  }
});
