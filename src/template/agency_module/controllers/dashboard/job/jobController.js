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
                
        $scope.submit = function(data) {
            jobService.createJob(data)
                    .then(function(result) {
                        if (result.error) {
                            alert(result.error);
                        } else {
                            $state.go('app.home.job', {jobId: result});
                        }
                        
                    });
        };
        
        var data = [
            { id: '1', title: 'AliceAlice Alice Alice Alice Alice Alice Alice Alice', post_date: 1464063726145, expire_date: 1464063726145, num_apply: 10},
            { id: '2', title: 'Bob', post_date: 1463677200000, expire_date: 1464063726145, num_apply: 10},
            { id: '3', title: 'Jack', post_date: 1453222800000, expire_date: 1464063726145, num_apply: 10}
        ];
        
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
                    value.is_close = value.is_close ? 1 : 0;
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