/**
 * Created by trananhgien on 3/26/2016.
 */

define([
  'app',
  'directives/search-bar/search-bar',
  'directives/job-grid/job-grid'
], function(app) {
    app.controller('searchController', function($scope, $stateParams, $state, searchService, utils) {
      alert("search");
        var lastJobId = -1;
        var params = $stateParams;
        $scope.searchBarData = {
            tags: $stateParams.tags,
            placeholder: 'Skill, Company Name, Job Title',
            text: '',
            items: []
        };
        
        $scope.jobs = [];
        $scope.locations = [];
        
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
                    $scope.searchBarData.items = result[0];
                    $scope.locations = locations;
                });
                
        $scope.doSearch = function(params) {
            $state.go('app.home.search', params, {location: true, notify: false, reload: false});
            search(params);
        };
        
        search(params);
        
        function search (params) {
            var searchReq = utils.Request.create();
            searchReq.addRequest(searchService.search(params));
            searchReq.all()
                .then(function(result) {
                    if (result.error) {
                        alert("Loi server");
                        return;
                    }
                    
                    console.log("append job");
                    
                    result = result[0];
                    lastJobId = result.last_job_id;
                    $scope.jobs = $scope.jobs.concat(result.data);
                    return true;
                });
        };
        
        $scope.$on("SearchState", function(event, params) {
            console.log("SeaerchState", params);
            $scope.searchBarData.tags = params.tags;
            $scope.doSearch(params);
        });
        
        $scope.loadMore = function() {
          $scope.loadingMore = true;
          params.lastJobId = lastJobId;
          search(params).then(function(res) {
            if (res) $scope.loadingMore = false;
          });
        };
    });
});
