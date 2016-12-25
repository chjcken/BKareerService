/**
 * Created by trananhgien on 4/10/2016.
 */

define([
  
], function() {

    
    function studentJobController($scope, utils, jobService, $stateParams) {
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
        
        
    }
    
    studentJobController.$inject = ['$scope', 'utils', 'jobService', '$stateParams'];
    return studentJobController;

});