/**
 * Created by trananhgien on 3/26/2016.
 */

define(['app'], function(app) {
    app.controller('searchController', function($scope, $stateParams, $state, searchService, utils) {

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
        requests.addRequest(utils.getLocations());
        
        requests.all()
                .then(function(result) {
                    if (result.error) {
                        alert(result.error);
                        return;
                    }
                    var locations = result[1];
                    locations.unshift({
                        id: 0,
                        name: 'All',
                        districts: [{id: 0, name: 'All'}]
                    });
                    console.log("locations", locations);
                    $scope.searchBarData.items = result[0];
                    $scope.locations = locations;
                });
                
        $scope.doSearch = function(params) {
            $state.go('app.home.search', params, {location: true, notify: false, reload: false});
            search(params);
        };
        
        search($stateParams);
        
        function search (params) {
            var searchReq = utils.Request.create();
            searchReq.addRequest(searchService.search(params));
            searchReq.all()
                .then(function(result) {
                    if (result.error) {
                        alert("Loi server");
                        return;
                    }
                    
                    $scope.jobs = result[0];
                });
        };
        
        $scope.$on("SearchState", function(event, params) {
            console.log("SeaerchState", params);
            $scope.searchBarData.tags = params.tags;
            $scope.doSearch(params);
        });
    });
});
