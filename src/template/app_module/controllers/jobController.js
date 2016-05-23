/**
 * Created by trananhgien on 3/31/2016.
 */

define(['app', 'AuthService', 'directives/modal/modal'], function(app) {

    app.controller('jobController', function($scope, $stateParams, jobService) {

        // show button apply job if only if current user's role is student
        // $scope.isStudent is defined in parent jobController, it maybe studentHomeController,
        // managerHomeController, agencyHomeController
        /**
         * $scope.isStudent: true if current user's role is student, false otherwise
         */
        $scope.applyButtonVisible = $scope.isStudent;


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
        
        jobService.get($stateParams.jobId)
                .then(function(job) {
                    $scope.job = job;
                    $scope.agency = job.agency;
                    $scope.jobs_similar = job.jobs_similar;
                    $scope.hasThumbImages = $scope.agency.url_imgs === undefined || $scope.agency.url_imgs.length == 0;
                    var url_imgs = $scope.agency.url_imgs || [];
                    var normalize = [];
                    for(var i = 0; i < url_imgs.length; i++) {
                        var obj = {
                            thumb: url_imgs[i],
                            img: url_imgs[i]
                        }
                        normalize.push(obj);
                    }
                    
                    $scope.agency.url_imgs = normalize;
                    jobSimilar(job);

        });
        
        function jobSimilar(job) {
            var jobsSimilar = job.jobs_similar;
            for (var i = 0; i < jobsSimilar; i++) {
                var job = jobsSimilar[i];
                if (job.id === $stateParams.jobId) {
                    jobsSimilar.splice(i, 1);
                    break;
                }
            }
            
            $scope.jobsSimilar = jobsSimilar;
        }

    });

});