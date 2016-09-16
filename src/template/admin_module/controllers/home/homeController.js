define([
  'app',
  'directives/job-grid/job-grid.js',
  'directives/search-bar/search-bar.js',
  'AuthService'], function(app) {
  function homeController($scope) {
    console.log("Admin home controller");
  }

  homeController.$inject = ['$scope'];
  app.controller('adminHomeController',homeController);
});
