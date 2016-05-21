/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'angular', 'directives/view-create-job/view-create-job'], function(app, angular) {
    var jobController = function($scope, utils, $q, jobService) {
        $scope.setCurrentTabIndex(1);
        $scope.locations = [];
        $scope.tags = [];
        
        var req = utils.MultiRequests;
        req.init();
        req.addRequest($q.when(utils.getLocations()));
        req.addRequest($q.when(utils.getTags()));
        
        req.doAllRequest()
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
                        }
                    });
        };
    };
    
    jobController.$inject = ['$scope', 'utils', '$q', 'jobService'];
    
    app.controller('agencyJobController',jobController);

});