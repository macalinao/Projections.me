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
    id: 'marketCap',
    name: 'Market Cap'
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
  var substringMatcher = function(strs) {
    return function findMatches(q, cb) {
      var matches, substrRegex, num;
      num = 0;
      // an array that will be populated with substring matches
      matches = [];
   
      // regex used to determine if a string contains the substring `q`
      substrRegex = new RegExp(q, 'i');
   
      // iterate through the pool of strings and for any string that
      // contains the substring `q`, add it to the `matches` array
      $.each(strs, function(i, str) {
        if (substrRegex.test(str)) {
          num++;
          if (num > 5)
            return;
          // the typeahead jQuery plugin expects suggestions to a
          // JavaScript object, refer to typeahead docs for more info
          matches.push({ value: str });
        }
      });
   
      cb(matches);
    };
  };
   
  var stocks = ["A", "AA", "AAPL", "ABC", "ABT", "ACE", "ACN", "ADBE", "ADI", "ADM", "ADP", "ADSK", "ADT", "AEE", "AEP", "AES", "AET", "AFL", "AGN", "AIG", "AIV", "AIZ", "AKAM", "ALL", "ALTR", "ALXN", "AMAT", "AMD", "AMGN", "AMP", "AMT", "AMZN", "AN", "ANF", "AON", "APA", "APC", "APD", "APH", "APOL", "ARG", "ATI", "AVB", "AVP", "AVY", "AXP", "AZO", "BA", "BAC", "BAX", "BBBY", "BBT", "BBY", "BCR", "BDX", "BEAM", "BEN", "BF.B", "BHI", "BIG", "BIIB", "BK", "BLK", "BLL", "BMC", "BMS", "BMY", "BRCM", "BRK.B", "BSX", "BTU", "BWA", "BXP", "C", "CA", "CAG", "CAH", "CAM", "CAT", "CB", "CBG", "CBS", "CCE", "CCI", "CCL", "CELG", "CERN", "CF", "CFN", "CHK", "CHRW", "CI", "CINF", "CL", "CLF", "CLX", "CMA", "CMCSA", "CME", "CMG", "CMI", "CMS", "CNP", "CNX", "COF", "COG", "COH", "COL", "COP", "COST", "COV", "CPB", "CRM", "CSC", "CSCO", "CSX", "CTAS", "CTL", "CTSH", "CTXS", "CVC", "CVH", "CVS", "CVX", "D", "DD", "DE", "DELL", "DF", "DFS", "DG", "DGX", "DHI", "DHR", "DIS", "DISCA", "DLTR", "DNB", "DNR", "DO", "DOV", "DOW", "DPS", "DRI", "DTE", "DTV", "DUK", "DVA", "DVN", "EA", "EBAY", "ECL", "ED", "EFX", "EIX", "EL", "EMC", "EMN", "EMR", "EOG", "EQR", "EQT", "ESRX", "ESV", "ETFC", "ETN", "ETR", "EW", "EXC", "EXPD", "EXPE", "F", "FAST", "FCX", "FDO", "FDX", "FE", "FFIV", "FHN", "FII", "FIS", "FISV", "FITB", "FLIR", "FLR", "FLS", "FMC", "FOSL", "FRX", "FSLR", "FTI", "FTR", "GAS", "GCI", "GD", "GE", "GILD", "GIS", "GLW", "GME", "GNW", "GOOG", "GPC", "GPS", "GS", "GT", "GWW", "HAL", "HAR", "HAS", "HBAN", "HCBK", "HCN", "HCP", "HD", "HES", "HIG", "HNZ", "HOG", "HON", "HOT", "HP", "HPQ", "HRB", "HRL", "HRS", "HSP", "HST", "HSY", "HUM", "IBM", "ICE", "IFF", "IGT", "INTC", "INTU", "IP", "IPG", "IR", "IRM", "ISRG", "ITW", "IVZ", "JBL", "JCI", "JCP", "JDSU", "JEC", "JNJ", "JNPR", "JOY", "JPM", "JWN", "K", "KEY", "KIM", "KLAC", "KMB", "KMI", "KMX", "KO", "KR", "KRFT", "KSS", "L", "LEG", "LEN", "LH", "LIFE", "LLL", "LLTC", "LLY", "LM", "LMT", "LNC", "LO", "LOW", "LRCX", "LSI", "LTD", "LUK", "LUV", "LYB", "M", "MA", "MAR", "MAS", "MAT", "MCD", "MCHP", "MCK", "MCO", "MDLZ", "MDT", "MET", "MHP", "MJN", "MKC", "MMC", "MMM", "MNST", "MO", "MOLX", "MON", "MOS", "MPC", "MRK", "MRO", "MS", "MSFT", "MSI", "MTB", "MU", "MUR", "MWV", "MYL", "NBL", "NBR", "NDAQ", "NE", "NEE", "NEM", "NFLX", "NFX", "NI", "NKE", "NOC", "NOV", "NRG", "NSC", "NTAP", "NTRS", "NU", "NUE", "NVDA", "NWL", "NWSA", "NYX", "OI", "OKE", "OMC", "ORCL", "ORLY", "OXY", "PAYX", "PBCT", "PBI", "PCAR", "PCG", "PCL", "PCLN", "PCP", "PCS", "PDCO", "PEG", "PEP", "PETM", "PFE", "PFG", "PG", "PGR", "PH", "PHM", "PKI", "PLD", "PLL", "PM", "PNC", "PNR", "PNW", "POM", "PPG", "PPL", "PRGO", "PRU", "PSA", "PSX", "PWR", "PX", "PXD", "QCOM", "QEP", "R", "RAI", "RDC", "RF", "RHI", "RHT", "RL", "ROK", "ROP", "ROST", "RRC", "RRD", "RSG", "RTN", "S", "SAI", "SBUX", "SCG", "SCHW", "SE", "SEE", "SHW", "SIAL", "SJM", "SLB", "SLM", "SNA", "SNDK", "SNI", "SO", "SPG", "SPLS", "SRCL", "SRE", "STI", "STJ", "STT", "STX", "STZ", "SWK", "SWN", "SWY", "SYK", "SYMC", "SYY", "T", "TAP", "TDC", "TE", "TEG", "TEL", "TER", "TGT", "THC", "TIE", "TIF", "TJX", "TMK", "TMO", "TRIP", "TROW", "TRV", "TSN", "TSO", "TSS", "TWC", "TWX", "TXN", "TXT", "TYC", "UNH", "UNM", "UNP", "UPS", "URBN", "USB", "UTX", "V", "VAR", "VFC", "VIAB", "VLO", "VMC", "VNO", "VRSN", "VTR", "VZ", "WAG", "WAT", "WDC", "WEC", "WFC", "WFM", "WHR", "WIN", "WLP", "WM", "WMB", "WMT", "WPI", "WPO", "WPX", "WU", "WY", "WYN", "WYNN", "X", "XEL", "XL", "XLNX", "XOM", "XRAY", "XRX", "XYL", "YHOO", "YUM", "ZION", "ZMH"];
  $('.typeahead').typeahead({
    hint: true,
    highlight: true,
    minLength: 1
  },
  {
    name: 'stocks',
    displayKey: 'value',
    source: substringMatcher(stocks)
  });

  $(".typeahead").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        var symbol = $(this).val().toUpperCase().trim();
        window.location='/app.html#/stock/' + symbol;
    }
  });

})

.controller('StockCtrl', function($scope, $http, $stateParams, allData) {
  var symbol = $stateParams.symbol;

  $scope.stockData = {};
  allData.subscribe(function(data) {
    $scope.stockData = _.find(data, function(el) {
      return el.symbol == symbol;
    });

    var n = {};
    var rating = $scope.stockData.eqyRecCons;

    if (rating > 4.5) {
      n = {
        style: 'strong-buy',
        text: 'Strong Buy'
      };
    } else if (rating > 3.75) {
      n = {
        style: 'weak-buy',
        text: 'Weak Buy'
      };
    } else if (rating > 3) {
      n = {
        style: 'hold',
        text: 'Hold'
      };
    } else if (rating > 2) {
      n = {
        style: 'weak-sell',
        text: 'Weak Sell'
      };
    } else {
      n = {
        style: 'strong-sell',
        text: 'Strong Sell'
      };
    }

    $scope.stockData.ratingNice = n;
  });

  $scope.dailyData = [];

  (new Spinner()).spin(document.getElementById('spinna'));

  setTimeout(function() {
  $http.get('/api/stock/' + symbol).success(function(data) {
    $('#spinna').remove();
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
}, 500);

  $scope.initialCapital = 10000;

  function calculatePl() {
    var last = $scope.stockData.last;
    var data = $scope.dailyData;
    window.dailyData = data;

    var monthDate = _.find(data, function(el) {
      return el.date == moment().subtract(1, 'month').day('Monday').format('YYYY-MM-DD')
    });
    var threeMonthDate = _.find(data, function(el) {
      return el.date == moment().subtract(3, 'month').day('Monday').format('YYYY-MM-DD')
    });
    var yearDate = _.find(data, function(el) {
      return el.date == moment().subtract(1, 'year').day('Monday').format('YYYY-MM-DD')
    });
    var fiveYearDate = _.find(data, function(el) {
      return el.date == moment().subtract(5, 'year').day('Monday').format('YYYY-MM-DD')
    });
    var tenYearDate = _.find(data, function(el) {
      return el.date == moment().subtract(10, 'year').day('Monday').format('YYYY-MM-DD')
    });


    var ic = $scope.initialCapital;
    $scope.pl = {
      month: monthDate ? (ic / monthDate.open * last) - ic: 'N/A',
      threeMonth: threeMonthDate ? (ic / threeMonthDate.open * last) - ic: 'N/A',
      year: yearDate ? (ic / yearDate.open * last) - ic: 'N/A',
      fiveYear: fiveYearDate ? (ic / fiveYearDate.open * last) - ic : 'N/A',
      tenYear: tenYearDate ? (ic / tenYearDate.open * last) - ic : 'N/A'
    };
  }

  calculatePl();
  $scope.$watch('initialCapital', function() {
    calculatePl();
  });
});
