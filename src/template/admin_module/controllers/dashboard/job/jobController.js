/**
 * Created by trananhgien on 9/7/2016.
 */
define([
  'app'
], function(app) {

  function adminJobController(vm, NgTableParams, searchService, jobService, utils, $filter) {
    vm.listJobs = [];
    vm.currentDate = new Date();
    
    var getData = function() {
      var req = utils.Request.create();
      req.addRequest(jobService.getAll({
        limit: 100,
        page: 1
      }));
      
      req.addRequest(utils.getLocations(true));
      
      return req.all().then(function(result) {
        if (result.error) {
            alert("Error " + result.error);
            return [];
        }

        var jobData = result[0];
        angular.forEach(jobData, function(value) {
           value.post_date_string = $filter('date')(value.post_date, 'MM/dd/yyyy');
           value.expire_date_string = $filter('date')(value.expire_date, 'MM/dd/yyyy');
           value.is_close = value.is_close || value.expire_date < (new Date()).getTime() ? 1 : 0;
        });

        vm.tableParams.settings({data: jobData});
        console.log("--->location", result[1]);
        vm.cities = result[1];
        vm.filter = {
          city: vm.cities[0],
          district: vm.cities[0].districts[0],
          agencies: []
        };
      });
    };

    vm.tableParams = new NgTableParams();

    getData();
  }
  
  adminJobController.$inject = ["$scope", "NgTableParams", "searchService", "jobService", "utils", "$filter"];
  app.controller('adminJobController', adminJobController);

});
