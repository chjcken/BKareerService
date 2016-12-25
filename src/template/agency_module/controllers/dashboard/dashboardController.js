/**
 * Created by trananhgien on 4/10/2016.
 */

define([], function() {

    function dashboardCtrl($scope, Session) {
       // alert('dashboard');
        $scope.currentTabIndex = 0;
        $scope.setCurrentTabIndex = function(idex) {
            $scope.currentTabIndex = idex;
        }
        
        $scope.userStatus = Session.getUserStatus();
        console.log("user status", $scope.userStatus);
    }
    
    dashboardCtrl.$inject = ['$scope', 'Session'];
    
    return dashboardCtrl;

});