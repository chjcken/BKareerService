/**
 * Created by trananhgien on 3/18/2016.
 */

define([], function() {

    function jobGrid() {
        return {
            restrict: 'E',
            scope: {
                jobs: "="
            },
            templateUrl:'directives/job-grid/job-grid.html',
            replace: false,
            link: function(scope) {
              scope.$watch('jobs', function(value) {
                if (value) {
                  angular.forEach(value, function(job) {
                    var districtName = job.location.district.name;
                    districtName = (Number(districtName) ? 'District ' : '') + districtName;
                    job.location.district.name = districtName;
                  });
                }
              });
            }
        };
    }

    return jobGrid;

});
