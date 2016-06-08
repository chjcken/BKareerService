/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'angular', 'directives/view-create-job/view-create-job', 'directives/tab/tabset'], function(app, angular) {
    var jobController = function($scope, utils, jobService, $timeout, $state, NgTableParams, $filter) {
        $scope.setCurrentTabIndex(1);
        $scope.locations = [];
        $scope.tags = [];
        $scope.jobs = [];
        $scope.job = {};
        
        var req = utils.Request.create(false);
        
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
        $scope.submitPromise = null;    
        $scope.submit = function(data) {
            req.init(false);
            req.addRequest(jobService.createJob(data));
            
            $scope.submitPromise = req.all().then(function(result) {
                        if (result.error) {
                            alert(result.error);
                        } else {
                            console.log("Create job result", result);
                            alert("Create Job Successfully");
                            $state.go('app.home.job', {jobId: result[0].id});
                        }
                        
                    });
        };
        

        
        var getData = function() {
             var req = utils.Request.create();
             req.addRequest(jobService.getAgencyJobs());
             return req.all().then(function(result) {
                 console.log('get agency job', result);
                 if (result.error) {
                     alert("Error " + result.error);
                     return [];
                 }
                 result = result[0];
                 angular.forEach(result, function(value) {
                    value.post_date_string = $filter('date')(value.post_date, 'MM/dd/yyyy');
                    value.expire_date_string = $filter('date')(value.expire_date, 'MM/dd/yyyy');
                    value.is_close = value.is_close || value.expire_date < (new Date()).getTime() ? 1 : 0;
                });
                
                $scope.tableParams.settings({data: result});
             });
        };
                
        $scope.tableParams = new NgTableParams();
        
        getData();
    };
    
    jobController.$inject = ['$scope', 'utils', 'jobService', '$timeout', '$state', 'NgTableParams', '$filter'];
    
    app.controller('agencyJobController',jobController);

});