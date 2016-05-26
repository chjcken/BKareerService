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
            
            $scope.students = students;
        });

        $scope.job = {
            title: 'Job title'
        }

        $scope.loadDetail = function(student) {
            var req = utils.Request.create(false);
            req.addRequest(jobService.getApplyDetail({jobid: jobId, studentid: student.id}));
            student.promise = req.all().then(function(result){
                        if (result.error) {
                            alert(result.error);
                            return;
                        }
                        
                        student.file = result[0].file;
                        student.note = result[0].note;
                    });
        };
        
        $scope.deny = function(student) {
            var r = confirm("Are you sure to deny student " + student.name);
            if (!r) return;
            
            var req = utils.Request.create(false);
            req.addRequest(jobService.deny({jobid: jobId, studentid: student.id}));
            student.promise = req.all().then(function(result){
                        if (result.error) {
                            alert(result.error);
                            return;
                        }
                        student.status = 'DENY';
                        alert("Success");
                    });
        };
        
        $scope.approve = function(student) {
            var r = confirm("DO you want to approve student " + student.name);
            if (!r) return;
            
            var req = utils.Request.create(false);
            req.addRequest(jobService.approve({jobid: jobId, studentid: student.id}));
            student.promise = req.all().then(function(result){
                        if (result.error) {
                            alert(result.error);
                            return;
                        }
                        student.status = 'APPROVE';
                        alert("Success");
                    });
        };

    });

});