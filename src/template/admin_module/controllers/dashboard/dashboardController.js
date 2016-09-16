/**
 * Created by trananhgien on 9/7/2016.
 */
define(['app', 'directives/view-sticky/sticky'], function(app) {

 app.controller('adminDashboardController', function($scope) {
   $scope.currentTab = 'criteria';
   $scope.setCurrentTab = function(tabName) {
     $scope.currentTab = tabName;
   }

   console.log('Admin dashboard controller');
 });

});
