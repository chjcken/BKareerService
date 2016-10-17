/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'directives/view-sticky/sticky'], function(app) {

    app.controller('studentDashboardController', function($scope) {
       // alert('dashboard');
        $scope._tabName = '';
        $scope._dashboardSetTabName = function(tabName) {
            $scope._tabName = tabName || "job";
        }

    });

});