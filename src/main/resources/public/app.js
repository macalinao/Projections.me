angular.module('projections', ['ui.router'])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('home', {
    url: '/',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl'
  })
  .state('stock', {
    url: '/stock/:stock',
    templateUrl: 'templates/stock.html',
    controller: 'StockCtrl'
  });

  $urlRouterProvider.otherwise('/');
})
.factory('fields', function() {
  return {
    last: 'Last',
    high: 'High',
    low: 'Low',
    close: 'Close',
    newsSentiment: 'News Sentiment',
    twitterSentiment: 'Twitter Sentiment',
    eqyRecCons: 'Buy Rating'
  };
})
.controller('HomeCtrl', function($scope, fields) {
  $scope.fields = fields;
  $scope.field = 'eqyRecCons';
});
