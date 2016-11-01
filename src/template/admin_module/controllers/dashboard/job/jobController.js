/**
 * Created by trananhgien on 9/7/2016.
 */
define([
  'app'
], function(app) {

  function adminJobController(vm, NgTableParams, searchService, jobService, utils, $filter) {
    vm.listJobs = [];
    vm.currentDate = new Date();
    vm.filter = {
      agencies: []
    };
    vm.agencies = [];
    
    function normalizeJobData(jobData) {
      angular.forEach(jobData, function(value) {
        value.post_date_string = $filter('date')(value.post_date, 'MM/dd/yyyy');
        value.expire_date_string = $filter('date')(value.expire_date, 'MM/dd/yyyy');
        value.is_close = value.is_close || value.expire_date < (new Date()).getTime() ? 1 : 0;
      });
    }
    
    var getData = function() {
      var req = utils.Request.create();
      req.addRequest(jobService.getAll({
        limit: 100,
        page: 1
      }));
      
      req.addRequest(utils.getLocations(true));
      req.addRequest(jobService.getAllAgencies());
      
      return req.all().then(function(result) {
        if (result.error) {
            alert("Error " + result.error);
            return [];
        }

        var jobData = result[0];
        normalizeJobData(jobData);

        vm.tableParams.settings({data: jobData});
        console.log("--->location", result[1]);
        console.log("--->agencies", result[2]);
        vm.cities = result[1];
        vm.agencies = result[2];
        vm.filter = {
          city: vm.cities[0],
          district: vm.cities[0].districts[0],
          agencies: []
        };
      });
    };

    vm.tableParams = new NgTableParams();

    getData();
    
    vm.doFilter = function() {
      var filter = vm.filter;
      var params = {
        city: filter.city.id === -1 ? null : filter.city.name,
        district: filter.district.id === -1 ? null : filter.district.name,
        fromDate: (new Date(filter.fromDate)).getTime(),
        toDate: (new Date(filter.toDate)).getTime()
      };
      
      var req = utils.Request.create();
      req.addRequest(searchService.search(params));
      req.all().then(function(res) {
        var jobs = res[0];
        normalizeJobData(res[0]);
        vm.tableParams.settings({data: jobs});
      });
    };
  }
  
  adminJobController.$inject = ["$scope", "NgTableParams", "searchService", "jobService", "utils", "$filter"];
  app.controller('adminJobController', adminJobController);

});
