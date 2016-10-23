
define([
  'app'
], function(app) {
  
  function notification(vm, noti, jobService) {
    
  }
  
  notification.$inject = ["$scope", "notification", "jobService"];
  app.controller("studentNotification", notification);
});

