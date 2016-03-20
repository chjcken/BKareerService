/**
 * Created by trananhgien on 3/18/2016.
 */

define(['app'], function(app) {

    app.directive('jobGrid', function() {
        return {
            restrict: 'E',
            scope: {
                jobs: "="
            },
            templateUrl:'directives/job-grid/job-grid.html',
            replace: false
        };
    });

});