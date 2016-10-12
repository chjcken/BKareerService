/**
 * Created by trananhgien on 3/15/2016.
 */
define([
  'app',
  'directives/job-grid/job-grid.js',
  'directives/search-bar/search-bar.js',
  'AuthService'],
  function(app) {
    
    function homeController(vm, Session) {
      
    }
    
    homeController.$inject = ["$scope", "Session"];
    
    app.controller('agencyHomeController', homeController);

});