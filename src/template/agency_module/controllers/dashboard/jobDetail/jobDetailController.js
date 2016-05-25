/**
 * Created by trananhgien on 5/24/2016.
 */

define(['app'], function(app) {

    app.controller('agencyJobDetailController', function($scope, $stateParams, jobService, utils) {

        var jobId = $stateParams.jobId;
        var students = [];
        var req = utils.Request.create();
        
        req.addRequest(jobService.get(jobId));
        req.all().then(function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
           
            $scope.job = result[0];
            students = $scope.job.applied_students;
            
            angular.forEach(students, function(value) {
                value.statusValue = value.status === 'Approve';
                value.promise = null;
                value.toggleStatus = function(isAccept) {
                    var deferred = $q.defer();
                    $timeout(function(){
                        deferred.resolve('OK');
                        value.status = isAccept ? 'Approve' : 'Pending';
                    }, 2000);

                    value.promise = deferred.promise;
                };
            });

            $scope.students = students;
        });

        $scope.job = {
            title: 'Job title'
        }

        

    });

});