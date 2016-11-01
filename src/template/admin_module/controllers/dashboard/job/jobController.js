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
      
      req.addRequest(utils.getLocations(true));
      req.addRequest(jobService.getAllAgencies());
      
      return req.all().then(function(result) {
        if (result.error) {
            alert("Error " + result.error);
            return [];
        }

        console.log("--->location", result[0]);
        console.log("--->agencies", result[1]);
        vm.cities = result[0];
        vm.agencies = result[1];
        vm.filter = {
          city: vm.cities[1],
          district: vm.cities[1].districts[0],
          agencies: []
        };
        
        vm.doFilter();
      });
    };

    vm.tableParams = new NgTableParams();

    getData();
    
    vm.doFilter = function() {
      var filter = vm.filter;
      var params = {
        includeinactive: true,
        city: filter.city.id === -1 ? null : filter.city.name,
        district: filter.district.id === -1 ? null : filter.district.name
      };
      var post = vm.isExpire ? "Expire" : "Post";
      
      params['from' + post] = (new Date(filter.fromDate)).getTime();
      params['to' + post] = (new Date(filter.toDate)).getTime();
      
           
      console.log("agency", filter.agencies);
      
      
      if (filter.agencies.length > 0) {
        params.listagency = [];
        angular.forEach(filter.agencies, function(agency) {
          params.listagency.push(agency.id);
        });
      }
      
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
