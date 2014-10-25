angular.module('projections', ['ui.router'])
  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      })
      .state('stock', {
        url: '/stock/:symbol',
        templateUrl: 'templates/stock.html',
        controller: 'StockCtrl'
      });

    $urlRouterProvider.otherwise('/');
  })
  .factory('fields', function() {
    return [{
      id: 'eqyRecCons',
      name: 'Buy Rating'
    }, {
      id: 'last',
      name: 'Last'
    }, {
      id: 'high',
      name: 'High'
    }, {
      id: 'low',
      name: 'Low'
    }, {
      id: 'close',
      name: 'Close'
    }, {
      id: 'newsSentiment',
      name: 'News Sentiment'
    }, {
      id: 'twitterSentiment',
      name: 'Twitter Sentiment'
    }];
  })

  .controller('HomeCtrl', function($scope, fields, $http) {
    $scope.fields = fields;
    $scope.field = fields[0];

    $scope.best = [];
    $scope.worst = [];

    function updateLists() {
      var fieldId = $scope.field.id;
      $http.get('/api/all').success(function(data) {
        $scope.best = _.first(data.sort(function(a, b) {
          return b[fieldId] - a[fieldId];
        }), 10);
        $scope.worst = _.first(data.sort(function(a, b) {
          return a[fieldId] - b[fieldId];
        }), 10);
      });
    }

    $scope.$watch('field', updateLists);
    updateLists();
  })

.controller('StockCtrl', function($scope, $http, $routeParams) {
  var symbol = $routeParams.symbol;

  $scope.stockData = {};
  $http.get('/api/all').success(function(data) {
    $scope.stockData = _.find(data, function(el) {
      return el.symbol == symbol;
    });
  });
});
