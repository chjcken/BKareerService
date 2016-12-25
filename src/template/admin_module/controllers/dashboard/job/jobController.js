/**
 * Created by trananhgien on 9/7/2016.
 */
define([
 
], function() {

  function adminJobController(vm, NgTableParams, searchService, jobService, utils, $filter, $timeout, $stateParams, toaster) {
    vm.listJobs = [];
    vm.currentDate = new Date();
    vm.filter = {
      agencies: []
    };
    vm.agencies = [];
    vm.dateType = "Post";
    vm.jobs = [];
    vm.currentPage = 1;
    vm.mode =  $stateParams.status === 'request' ? 'REQUEST_JOB' : 'ACTIVE_JOB';
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

        vm.cities = result[0];
        vm.agencies = result[1];
        vm.filter = {
          city: vm.cities[0],
          district: vm.cities[0].districts[0],
          agencies: []
        };
        
        vm.doFilter();
      });
    };

    vm.tableActive = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});
    vm.tableRequest = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});

    getData();
    
    vm.doFilter = function(isLoadMore) {
      
      var params = getParams();
      if (isLoadMore) params.lastJobId = lastJobId;
      var req = utils.Request.create();
      req.addRequest(searchService.search(params));
      return req.all().then(function(res) {
        var jobs = res[0].data;
        var tableParams = getTableParams();
        lastJobId = res[0].last_id;
        
        normalizeJobData(jobs);
        if (isLoadMore) vm.jobs = vm.jobs.concat(jobs);
        else vm.jobs = jobs;
        if (isLoadMore) vm.currentPage = tableParams.page();
        tableParams.settings({data: vm.jobs, page: vm.currentPage});
        
        
        if (isLoadMore) {
          $timeout(function() {
            tableParams.page(vm.currentPage);
          }, 0);
        }
        
        return true;
      });
    };
    
    
    
    vm.loadMore = function() {
      vm.isLoading = true;
      vm.doFilter(true).then(function(res) {
        vm.isLoading = false;
      });
    }
    
    vm.activeJob = function(job) {
      jobService.activeJob(job.id)
        .then(function(res) {
          res = res.data;
          if (res.success !== 0) {
            return toaster.pop('error', 'ERROR', 'Active job failed\n' + utils.getError(res.success));
          }
          
          toaster.pop('success', '', 'Job "' + job.title + '" actived');
          var jobIndex = utils.containsObject(vm.jobs, job.id, "id");
          vm.jobs.splice(jobIndex, 1);
          vm.tableRequest.reload().then(function(data) {
            if (data.length === 0 && vm.tableRequest.total() > 0) {
              vm.tableRequest.page(vm.tableRequest.page() - 1);
              vm.tableRequest.reload();
            }
          });

        });
    };
    
    function getTableParams() {
      return vm.mode === 'ACTIVE_JOB' ? vm.tableActive : vm.tableRequest;
    }
    
    function getParams() {
      var filter = vm.filter;
      var params = {
        city: filter.city.id === -1 ? null : filter.city.name,
        district: filter.district.id === -1 ? null : filter.district.name
      };
      var post = vm.dateType;
      
      if (vm.mode === 'ACTIVE_JOB') {
        params.includeexpired = true;

      } else {
        params.jobStatus = 2;
      }
      
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
  
  adminJobController.$inject = [
            "$scope",
            "NgTableParams", 
            "searchService", 
            "jobService", 
            "utils", 
            "$filter", 
            "$timeout",
            "$stateParams",
            "toaster"
  ];
  
  return adminJobController;

});
