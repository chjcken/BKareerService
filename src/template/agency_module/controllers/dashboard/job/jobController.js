/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'angular', 'directives/view-create-job/view-create-job'], function(app, angular) {
    var jobController = function($scope, utils, jobService, $timeout, $state) {
        $scope.setCurrentTabIndex(1);
        $scope.locations = [];
        $scope.tags = [];
        
        var req = utils.Request.create();
        
        req.addRequest(utils.getLocations());
        req.addRequest(utils.getTags());
        
        req.all()
                .then(function(result) {
                    if (result.error) {alert('Loi server');}
                    else {
                        console.log(result);
                        $scope.locations = result[0];
                        $scope.tags = result[1];
                    }
                });
                
        $scope.submit = function(data) {
            jobService.createJob(data)
                    .then(function(result) {
                        if (result.error) {
                            alert(result.error);
                        } else {
                            alert("Thanh cong");
                            $timeout(function() {
                                //$state.go('app.home.job', {jobId: result.id});
                            }, 1000);
                        }
                        
                    });
        };
    };
    
    jobController.$inject = ['$scope', 'utils', 'jobService', '$timeout', '$state'];
    
    app.controller('agencyJobController',jobController);

});