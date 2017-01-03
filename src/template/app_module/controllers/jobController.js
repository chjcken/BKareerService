/**
 * Created by trananhgien on 3/31/2016.
 */

define([

], function() {

    function jobCtrl($scope, $stateParams, jobService, utils, Session, USER_ROLES, statistic, $state) {
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

            var job = result[0];
            var districtName = job.location.district.name;
            districtName = (Number(districtName) ? 'District ' : '') + districtName;
            job.location.district.name = districtName;

            $scope.job = job;
            if ($scope.job.status !== 0) {
              return $state.go('app.home.newjobs');
            }
            $scope.applyButtonVisible = $scope.applyButtonVisible && !$scope.job.is_applied;
            $scope.agency = $scope.job.agency;
            $scope.jobs_similar = $scope.job.jobs_similar;
            $scope.hasThumbImages = $scope.agency.url_imgs === undefined || $scope.agency.url_imgs.length == 0;
            var url_imgs = $scope.agency.url_imgs || [];
            var url_thumbs = $scope.agency.url_thumbs || [];
            var normalize = [];
            for(var i = 0; i < url_imgs.length; i++) {
                var obj = {
                    thumb: url_thumbs[i] ? url_thumbs[i] : url_imgs[i],
                    img: url_imgs[i]
                }
                normalize.push(obj);
            }
            
            var mapImageUrl = job.location.city.name + ", " + job.location.district.name + ", " + utils.random(2, 50) + " " + job.location.address;
            $scope.mapUrl = "https://www.google.com/maps?q=" + mapImageUrl;
            
            mapImageUrl = mapImageUrl.trim().replace(/\s+/g, "+");
            
            var link = "https://maps.googleapis.com/maps/api/staticmap?center=" + mapImageUrl + "&zoom=18&scale=false&size=250x125&maptype=roadmap&format=png&visual_refresh=true&markers=size:mid%7Ccolor:0xff0000%7Clabel:1%7C" + mapImageUrl;
            
            $scope.mapImageUrl = link;
            
            $scope.agency.url_imgs = normalize.length < 3 ? [] : normalize;
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

    }

    jobCtrl.$inject = ['$scope', '$stateParams', 'jobService', 'utils', 'Session', 'USER_ROLES', 'statistic', '$state'];
    return jobCtrl;

});
