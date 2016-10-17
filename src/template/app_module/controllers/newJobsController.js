/**
 * Created by trananhgien on 3/26/2016.
 */

define([
  'app', 
  'AuthService',
  'directives/job-grid/job-grid',
  'directives/search-bar/search-bar'
], function(app) {

    app.controller('newJobsController', function($scope, $stateParams, $state, jobService, utils) {

        console.log($stateParams.type);
        $scope.locations = []
        $scope.jobs = [];
        $scope.searchBarData = {
            tags: ['Java'],
            placeholder: 'Skill, Company Name, Job Title',
            text: '',
            items: []
        }
        var mRequests = utils.Request.create();
        
        if ($stateParams.type === 'job') {
            mRequests.addRequest(jobService.getAll(2));
                
        } else if ($stateParams.type === 'internship') {
            mRequests.addRequest(jobService.getAll(1));
        }
        
        mRequests.all()
                .then(function(result) {
                    $scope.jobs = result[0];
                });
        
        var requests = utils.Request.create(false);
        requests.addRequest(utils.getTags());
        requests.addRequest(utils.getLocations(true));
        
        requests.all()
                .then(function(result) {
                    if (result.error) {
                        alert(result.error);
                        return;
                    }
                    
                    var locations = result[1];
                    console.log("location --> ", locations);
                    $scope.searchBarData.items = result[0];
                    $scope.locations = locations;
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

    });

});