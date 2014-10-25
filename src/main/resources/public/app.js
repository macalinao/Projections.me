angular.module('projections', ['ui.bootstrap', 'ui.router'])

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

.factory('allData', function($http) {
  var ret = {
    data: [],
    subs: [],
    subscribe: function(cb) {
      if (this.data.length > 0) {
        cb(this.data);
        return;
      }
      this.subs.push(cb);
    }
  };

  $http.get('/api/all').success(function(data) {
    for (var i = 0; i < ret.subs.length; i++) {
      ret.subs[i](data);
    }
    ret.data = data;
  });

  return ret;
})

.controller('HomeCtrl', function($scope, fields, $http, allData, $location) {
  $scope.fields = fields;
  $scope.field = fields[0];

  $scope.best = [];
  $scope.worst = [];

  function updateLists() {
    var fieldId = $scope.field.id;
    allData.subscribe(function(data) {
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

  $scope.searchStock = function() {
    var symbol = $scope.symbol.toUpperCase().trim();
    $location.path('stock/' + symbol);
  };
})

.controller('StockCtrl', function($scope, $http, $stateParams, allData) {
  var symbol = $stateParams.symbol;

  $scope.stockData = {};
  allData.subscribe(function(data) {
    $scope.stockData = _.find(data, function(el) {
      return el.symbol == symbol;
    });
  });

  $scope.dailyData = [];

  $http.get('/api/stock/' + symbol).success(function(data) {
    $scope.dailyData = data;

    var dataMapped = _.map(data, function(el) {
      return [new Date(el.date), parseFloat(el.open.toFixed(2))];
    });

    $('#stockChart').highcharts('StockChart', {
      rangeSelector: {
        selected: 100000
      },
      title: {
        text: 'Stock Data'
      },
      series: [{
        name: 'Price',
        data: dataMapped
      }],
      tooltip: {
        formatter: function() {
          return Highcharts.dateFormat('%b %d, %Y', this.x) + ' - $' + this.y.toFixed(2);
        }
      }
    });

    calculatePl();

  });

  $scope.initialCapital = 10000;

  function calculatePl() {
    var last = $scope.stockData.last;
    var data = $scope.dailyData;
    window.dailyData = data;

    var monthDate = _.find(data, function(el) {
      return el.date == moment().subtract(1, 'month').format('YYYY-MM-DD')
    });
    var threeMonthDate = _.find(data, function(el) {
      return el.date == moment().subtract(3, 'month').format('YYYY-MM-DD')
    });
    var yearDate = _.find(data, function(el) {
      return el.date == moment().subtract(1, 'year').format('YYYY-MM-DD')
    });
    var fiveYearDate = _.find(data, function(el) {
      return el.date == moment().subtract(5, 'year').format('YYYY-MM-DD')
    });


    var ic = $scope.initialCapital;
    $scope.pl = {
      month: monthDate ? ((last - monthDate.open) * ic) : 'N/A',
      threeMonth: threeMonthDate ? ((last - threeMonthDate.open) * ic) : 'N/A',
      year: yearDate ? ((last - yearDate.open) * ic) : 'N/A',
      fiveYear: fiveYearDate ? ((last - fiveYearDate.open) * ic) : 'N/A'
    };
  }

  calculatePl();
  $scope.$watch('initialCapital', function() {
    calculatePl();
  });
});
