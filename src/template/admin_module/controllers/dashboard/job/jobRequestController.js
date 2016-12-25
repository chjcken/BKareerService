/**
 * Created by trananhgien on 9/7/2016.
 */
define([
], function() {

  function adminJobRequestController(vm, NgTableParams, searchService, jobService, utils, $filter, $timeout) {
    vm.listJobs = [];
    vm.currentDate = new Date();
    vm.filter = {
      agencies: []
    };
    vm.agencies = [];
    vm.dateType = "Post";
    vm.jobs = [];
    vm.currentPage = 1;
    var lastJobId = -1;
    
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

    vm.tableParams = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});

    getData();
    
    vm.doFilter = function(isLoadMore) {
      
      var params = getParams();
      if (isLoadMore) params.lastJobId = lastJobId;
      var req = utils.Request.create();
      req.addRequest(searchService.search(params));
      return req.all().then(function(res) {
        var jobs = res[0].data;
        lastJobId = res[0].last_job_id;
        
        normalizeJobData(jobs);
        if (isLoadMore) vm.jobs = vm.jobs.concat(jobs);
        else vm.jobs = jobs;
        vm.currentPage = vm.tableParams.page();
        vm.tableParams.settings({data: vm.jobs, page: vm.currentPage});
        $timeout(function() {
          vm.tableParams.page(vm.currentPage);
        }, 0);
        
        return true;
      });
    };
    
    vm.loadMore = function() {
      vm.isLoading = true;
      vm.doFilter(true).then(function(res) {
        vm.isLoading = false;
      });
    }
    
    function getParams() {
      var filter = vm.filter;
      var params = {
        includeinactive: true,
        city: filter.city.id === -1 ? null : filter.city.name,
        district: filter.district.id === -1 ? null : filter.district.name
      };
      var post = vm.dateType;
      
      params['from' + post] = (new Date(filter.fromDate)).getTime();
      params['to' + post] = (new Date(filter.toDate)).getTime();      
      
      if (filter.agencies.length > 0) {
        params.listagency = [];
        angular.forEach(filter.agencies, function(agency) {
          params.listagency.push(agency.id);
        });
        
        delete params.city;
        delete params.district;
      }
      
      return params;
    }
  }
  
  adminJobRequestController.$inject = ["$scope", "NgTableParams", "searchService", "jobService", "utils", "$filter", "$timeout"];
  return adminJobRequestController;

});
