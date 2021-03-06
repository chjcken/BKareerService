/**
 * Created by trananhgien on 3/26/2016.
 */

define([
], function() {

    function newJobsController($scope, $stateParams, $state, jobService, utils) {

        var lastJobId = -1;
        $scope.loadingMore = false;
        $scope.locations = []
        $scope.jobs = [];
        $scope.popularTags = [];
        $scope.searchBarData = {
            tags: ['Java'],
            placeholder: 'Skill, Company Name, Job Title',
            text: '',
            items: []
        }

        var mRequests = utils.Request.create();
        mRequests.addRequest(jobService.getAll(2));

        mRequests.all()
                .then(function(result) {
                    result = result[0];
                    lastJobId = result.last_id;
                    $scope.jobs = result.data;
                });

        var requests = utils.Request.create(false);
        requests.addRequest(utils.getTags());
        requests.addRequest(utils.getLocations(true));
        requests.addRequest(utils.getPopularTags());

        requests.all()
                .then(function(result) {
                    if (result.error) {
                        alert(result.error);
                        return;
                    }

                    var locations = result[1];
                    var popularTags = result[2];
                    $scope.searchBarData.items = result[0];
                    $scope.locations = locations;

                    angular.forEach(popularTags, function(tag) {
                      $scope.popularTags.push(tag.name);
                    });

                });



        /**
         * Get search result from server and update model "jobs"
         * @param params Object {tags: [], text: '', location: {city: '', district: ''}}
         */
        $scope.doSearch = function(params) {
            /*var data = searchService.search(params);
             data.then(function(searchResult){
             $scope.jobs = searchResult;
             });*/
            console.log("params", params);
            if (params.city === 'All') delete params.city;
            if (params.district === 'All') delete params.district;

            $state.go('app.home.search', params);
        };

        $scope.loadMore = function() {
          $scope.loadingMore = true;
          jobService.getAll(2, lastJobId)
                  .then(function(res) {
                     if (res.data.success != 0) {
                       return toaster.pop("error", "Server Error", "error");
                     }
                     var res = res.data.data;

                     $scope.loadingMore = false;
                     lastJobId = res.last_id;
                     $scope.jobs = $scope.jobs.concat(res.data);

                  });
        };

    }

    newJobsController.$inject = ['$scope', '$stateParams', '$state', 'jobService', 'utils'];
    return newJobsController;

});
