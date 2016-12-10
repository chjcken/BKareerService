/**
 * Created by trananhgien on 3/31/2016.
 */

define([
  'app',
  'AuthService',
  'directives/modal/modal',
  'directives/view-sticky/sticky'
], function(app) {

    app.controller('jobController', function($scope, $stateParams, jobService, utils, Session, USER_ROLES, statistic) {
        // show button apply job if only if current user's role is student
        /**
         * $scope.isStudent: true if current user's role is student, false otherwise
         */
        $scope.applyButtonVisible = Session.getUserRole() === USER_ROLES.student;

        // because we use ngIf to attach modal to DOM, but ngIf created its scope,
        // so we must create a object to save reference to $scope of this controller
        $scope.modal = {
            visible: false,
            toggleModal: function() {
                this.visible = !this.visible;
            }
        };
        
        $scope.agency = {
            url_imgs: [
                {
                    thumb: 'assets/images/default.png',
                    img: 'assets/images/default.png'
                },
                {
                    thumb: 'assets/images/default.png',
                    img: 'assets/images/default.png'
                },
                {
                    thumb: 'assets/images/default.png',
                    img: 'assets/images/default.png'
                }
            ]
        }
        var jobId = $stateParams.jobId;
        var req = utils.Request.create();
        
        req.addRequest(jobService.get(jobId));
        req.all().then(function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            
            $scope.job = result[0];
            $scope.agency = $scope.job.agency;
            $scope.jobs_similar = $scope.job.jobs_similar;
            $scope.hasThumbImages = $scope.agency.url_imgs === undefined || $scope.agency.url_imgs.length == 0;
            var url_imgs = $scope.agency.url_imgs || [];
            var url_thumbs = $scope.agency.url_thumbs || [];
            var normalize = [];
            for(var i = 0; i < url_imgs.length; i++) {
                var obj = {
                    thumb: url_thumbs[i],
                    img: url_imgs[i]
                }
                normalize.push(obj);
            }

            $scope.agency.url_imgs = normalize;
            jobSimilar($scope.job);
            
            statistic.logJobView($scope.job.tags);
        });
        
        
        function jobSimilar(currentJob) {   
            var jobsSimilar = currentJob.jobs_similar;
            for (var i = 0; i < jobsSimilar.length; i++) {
                var job = jobsSimilar[i];
                if (job.id == $stateParams.jobId) {
                    jobsSimilar.splice(i, 1);
                    
                    break;
                }
            }
            
            $scope.jobsSimilar = jobsSimilar;
        }

    });

});