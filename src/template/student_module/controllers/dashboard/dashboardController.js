/**
 * Created by trananhgien on 4/10/2016.
 */

define([], function() {

    function studentDashboardController($scope) {
       // alert('dashboard');
        $scope._tabName = '';
        $scope._dashboardSetTabName = function(tabName) {
            $scope._tabName = tabName || "job";
        }

    }
    
    studentDashboardController.$inject = ['$scope'];
    
    return studentDashboardController;

});