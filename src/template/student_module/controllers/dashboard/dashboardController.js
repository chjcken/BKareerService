/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'directives/view-sticky/sticky'], function(app) {

    app.controller('studentDashboardController', function($scope) {
       // alert('dashboard');
        $scope.currentTabIndex = 0;
        $scope.setCurrentTabIndex = function(idex) {
            $scope.currentTabIndex = idex;
        }

    });

});