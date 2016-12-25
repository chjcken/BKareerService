/**
 * Created by trananhgien on 9/7/2016.
 */
define([], function() {

 function adminDashboardController($scope) {
   $scope.currentTab = 'criteria';
   $scope.setCurrentTab = function(tabName) {
     $scope.currentTab = tabName;
   };

   console.log('Admin dashboard controller');
 }
 
 adminDashboardController.$inject = ['$scope'];
 return adminDashboardController;
});
