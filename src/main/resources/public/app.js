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
.controller('HomeCtrl', function($scope) {
});
