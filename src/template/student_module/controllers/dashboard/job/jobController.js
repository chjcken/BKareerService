/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app'], function(app) {

    app.controller('studentJobController',['$scope', 'utils', 'jobService', 
        function($scope, utils, jobService) {
        //alert('manage job');
        $scope._dashboardSetTabName("job");
        
        var req = utils.Request.create();
        
        req.addRequest(jobService.getApplied());
        req.all().then(function(result) {
            if (result && result.error) alert(result.error);
            else {
                console.log("resut applied job", result);
                $scope.jobs = result[0];
            }
        });
        
        
    }]);

});