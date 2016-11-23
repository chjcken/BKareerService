/**
 * Created by trananhgien on 4/10/2016.
 */

define([
  'app', 
  'angular', 
  'directives/modal/modal'
], function(app, angular) {
    var jobController = function($scope, utils, jobService, $timeout, $state, NgTableParams, $filter, criteria) {
        $scope.setCurrentTabIndex(1);
               
        var getData = function() {
          var req = utils.Request.create();
          req.addRequest(jobService.getAgencyJobs());
          return req.all().then(function(result) {
            console.log('get agency job', result);
            if (result.error) {
                alert("Error " + result.error);
                return [];
            }

            var jobData = result[0].data;
            angular.forEach(jobData, function(value) {
               value.post_date_string = $filter('date')(value.post_date, 'MM/dd/yyyy');
               value.expire_date_string = $filter('date')(value.expire_date, 'MM/dd/yyyy');
               value.is_close = value.is_close || value.expire_date < (new Date()).getTime() ? 1 : 0;
            });
            
            $scope.tableParams.settings({data: jobData});
           
          });
        };
        
        $scope.tableParams = new NgTableParams();
        
        getData();
        
    };
    
    jobController.$inject = ['$scope', 'utils', 'jobService', '$timeout', '$state', 'NgTableParams', '$filter', 'criteria'];
    
    app.controller('agencyJobController',jobController);

});