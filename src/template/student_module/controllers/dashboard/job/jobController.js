/**
 * Created by trananhgien on 4/10/2016.
 */

define([
  'app',
  'directives/job-grid/job-grid'
], function(app) {

    app.controller('studentJobController',['$scope', 'utils', 'jobService', '$stateParams',
        function($scope, utils, jobService, $stateParams) {
        //alert('manage job');
        var notiId = $stateParams.notiid;
        $scope._dashboardSetTabName("job");
        $scope.jobs = [];
        var req = utils.Request.create();
        
        if (notiId) {
          notification.seenNoti(notiId);
        }
        
        req.addRequest(jobService.getApplied());
        req.all().then(function(result) {
            if (result && result.error) alert(result.error);
            else {
                $scope.jobs = result[0];
                console.log($scope.jobs)
            }
        });
        
        
    }]);

});