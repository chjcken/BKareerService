define([
  'app'
], function(app) {
  
  function statCtrl(vm, statistic, $filter, utils) {
    vm.statTypes = ["New Job", "Apply Job", "Popular Technical", "Popular Apply Technical", "Job's View"];
    vm.filter = {
      fromDate: $filter('date')(new Date(), 'yyyy/MM/dd'),
      toDate: $filter('date')(new Date(), 'yyyy/MM/dd')
    };
    vm.filter.stat = vm.statTypes[0];
    vm.reportSet = [];
    vm.period = "date";
    statistic.setGroupTime("date");
    
    var mapMethod = {
      "New Job": {
        "get": statistic.getNewJob,
        "getRt": statistic.getNewJobRt
      },
      "Apply Job": {
        "get": statistic.getApplyJob,
        "getRt": statistic.getApplyJobRt
      },
      "Popular Technical": {
        "get": statistic.getPopularTag,
        "getRt": statistic.getPopularTagRt
      },
      "Popular Apply Technical": {
        "get": statistic.getPopularJobApplyTag,
        "getRt": statistic.getPopularJobApplyTag
      },
      "Job's View": {
        "get": statistic.getJobView,
        "getRt": statistic.getJobViewRt
      }
    };
    
    var basePieChartConfig = {
        options: {
          chart: {
              plotBackgroundColor: null,
              plotBorderWidth: null,
              plotShadow: false,
              type: 'pie'
          },
          tooltip: {
            enabled: false       
        },
          plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
          }
        },
        title: {
            text: 'title'
        },
        
        loading: true
      };
      
    var baseBarChartConfig = {
      options: {
        chart: {
          type: "column"
        },
        plotOptions: {
          column: {
            color: "#0795DF"
          }
        }
      },
      title: {
        text: ""
      },
      loading: true,
      xAxis: {
        categories: [],
        title: {
          text: ""
        }
      },
      yAxis: {
        min: 0,
        title: {
          text: "Quantity"
        }
      }
    };
    
    vm.charts = {
      "New Job": {
        config: {},
        show: function() {
          
        }
      },
      "Apply Job": {
        config: {},
        show: function() {
          
        }
      },
      "Popular Technical": {
        config: {}
      },
      "Popular Apply Technical": {
        config: {},
        show: function() {
          
        }
      },
      "Job's View": {
        show: function (){
          
        }
      }
    };
    
    vm.loadStat = loadStat;
    
    init();
    
    loadStat(true);
   
    vm.changeGroupTime = function(period) {
      statistic.setGroupTime(period);
    };
    
    function init() {
      angular.copy(baseBarChartConfig, vm.charts["New Job"].config);
      vm.charts["New Job"].config.title.text = "New Job";
      
      angular.copy(baseBarChartConfig, vm.charts["Apply Job"].config);
      vm.charts["Apply Job"].config.title.text = "Applications";
      
      angular.copy(basePieChartConfig, vm.charts["Popular Technical"].config);
      vm.charts["Popular Technical"].config.title.text = "Popular Technical";
      
      angular.copy(basePieChartConfig, vm.charts["Popular Apply Technical"].config);
      vm.charts["Popular Apply Technical"].config.title.text = "Popular Apply Technical";
    }
    
    function loadStat(isLoadAll) {
      var from = new Date(vm.filter.fromDate);
      var to = new Date(vm.filter.toDate);
      var today = new Date();
      var isIncludeToday = $filter("date")(to, "YYYY/mm/dd") === $filter("date")(today, "YYYY/mm/dd");
      
      var req = utils.Request.create(true);
      
      if (!isLoadAll) {
        req.addRequest(mapMethod[vm.filter.stat].get(from, to));
        if (isIncludeToday) {
          req.addRequest(mapMethod[vm.filter.stat].getRt());
        }

        req.all().then(function(res) {
          var data = res[0];
          if (isIncludeToday) {
            data.push({date: today.getTime(), data: res[1]});
          }

          drawChart(vm.filter.stat, data);
        });
        
        return;
      }
      
      angular.forEach(vm.statTypes, function(stat) {
        req.addRequest(mapMethod[stat].get(from, to));
        if (isIncludeToday) {
          req.addRequest(mapMethod[stat].getRt());
        }
      });
      
      req.all().then(function(res) {
        var index = 0;
        var reportSet = [];
        angular.forEach(vm.statTypes, function(stat) {
          var set = {name: stat, data: res[index++]};
          if (isIncludeToday) {
            set.data.push({date: today.getTime(), data: res[index++]});
          }
          reportSet.push(set);
        });
         
        sumReportSet(reportSet);
      });
    }
    
    
    vm.periodStat = function(period) {
      vm.currentPeriod = period;
      
      var time;
      switch(period) {
        case 'today':
          time = [new Date(), new Date()];
          break;
        case 'week':
          time = utils.time.getCurrentWeek();
          break;
        case 'month':
          time = utils.time.getCurrentMonth();
          break;
        case 'year':
          time = utils.time.getCurrentYear();
          break;
      }
            
      vm.filter.fromDate = $filter("date")(time[0], 'yyyy/MM/dd');
      vm.filter.toDate = $filter("date")(time[1], 'yyyy/MM/dd');
      vm.loadStat();
    };
    
    function sumReportSet(reportSet) {
      angular.forEach(reportSet, function(report) {
        if (report.name === "New Job" || report.name === "Apply Job") {
          sum = 0;
          report.icon = report.name === "New Job" ? "fa fa-plus" : "fa fa-file";
          angular.forEach(report.data, function(value) {
            sum += value.data;
          });
          var reportData = report.data;
          var barData = createBarData(report.data);          
          report.data = sum;
          
          if (!canDrawBarChart()) return;
          
          var series = [{
            name: vm.filter.fromDate + " to " + vm.filter.toDate,
            data: barData  
          }];
        
          vm.charts[report.name].config.xAxis.categories = vm.period === 'date' ? createXAxisCat(new Date(vm.filter.fromDate), new Date(vm.filter.toDate))
          : createXAxisFromData(reportData);
          
          vm.charts[report.name].config.xAxis.title.text = "Time";
          
          drawChart(report.name, series);
          
        } else if (report.name === "Popular Technical" || report.name === "Popular Apply Technical") {
          report.icon = report.name === "Popular Technical" ? "fa fa-mortar-board" : "fa fa-pencil-square";
          var sum = [];
          var total = 0;
          var hash = {};
          console.log("data", report.data);
          angular.forEach(report.data, function(list) {
            angular.forEach(list.data, function(tag) {
              if (typeof tag !== "object") return;
              if (!hash[tag.name]) {
                hash[tag.name] = 0;
              }
              
              hash[tag.name] += tag.data;
              total += tag.data;
            });
          });
          
          for (var tag in hash) {
            if (hash.hasOwnProperty(tag)) {
              sum.push({name: tag, data: hash[tag]});
            }
          }
          var sorted = sum.sort(function (a, b) {
            return b.data - a.data;
          });
                    
          report.data = sorted.slice(0, Math.min(10, sorted.length));
          
          var chartData = convertPercentage(report.data);
          chartData[0].sliced=true;
          chartData[0].selected = true;

          
          var series = [{
            name: report.name,
            colorByPoint: true,
            data: chartData
          }];
          drawChart(report.name, series);
          
        } else {
          report.icon = "fa fa-eye";
          sum = {guest: 0, member: 0};
          
          angular.forEach(report.data, function(viewCount) {
            sum.guest += viewCount.guest;
            sum.member += viewCount.logged_in;
          });
          
          report.data = sum;
        }
      });
      
      vm.reportSet = reportSet;
    }
    
    function drawChart(name, data) {
      vm.charts[name].config.series = data;
      vm.charts[name].isShow = true;
      vm.charts[name].config.loading = false;
    }
    
    function hideChart(name) {
      vm.charts[name].isShow = false;
    }
    
    function convertPercentage(data, total) {
      var arr = [];
      var total = 0;
      angular.forEach(data, function(d) {
        total += d.data;
      });
      
      angular.forEach(data, function(d) {
        arr.push({name: d.name, y: +(d.data/total*100).toFixed(2)});
      });
      
      return arr;
    }
    
    function createBarData(data) {
      var res = [];
      angular.forEach(data, function(item) {
        res.push(item.data);
      });
            
      return res;
    }
    
    function createXAxisCat(from, to) {
      if (from.getTime() > to.getTime()) return [];
      
      var cat = [], hasM = true;
      var nextDate = from;
      if (from.getMonth() === to.getMonth()) {
        hasM = false;
      }
      
      while(nextDate.getTime() <= to.getTime()) {
        cat.push(hasM ? $filter("date")(nextDate, "dd-MM") : nextDate.getDate().toString());
        nextDate = new Date(nextDate.getTime() + 86400*1e3);
      }
      
      return cat;
    }
    
    function createXAxisFromData(data) {
      var cat = [];
      angular.forEach(data, function(val) {
        cat.push(val.date);
      });
      console.log(cat);
      return cat;
    }
    
    function canDrawBarChart() {
      var time = new Date(vm.filter.toDate) - new Date(vm.filter.fromDate);
      return time < 86400*1e3*30 && time > 0 || (vm.period === 'month' || vm.period === 'year');
    }
  }
  
  statCtrl.$inject = ["$scope", "statistic", "$filter", "utils"];
  
  app.controller("adminStatisticController", statCtrl);
});