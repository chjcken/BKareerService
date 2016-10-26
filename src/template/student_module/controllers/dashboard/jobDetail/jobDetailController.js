/*
 * student job detail controller
 */
define([
  'app'
], function(app) {
  
  function jobDetailController(vm, $state, $stateParams, utils, jobService, notification) {
    var jobId = $stateParams.jobId;
    var notiId = $stateParams.notiid;
    console.log("--studentJobDetailController-->", notiId);
    if (notiId) notification.seenNoti(notiId).then(function() { $state.go("app.dashboard.job"); })
    
  }
  
  jobDetailController.$inject = ["$scope", "$state", "$stateParams", "utils", "jobService", "notification"];
  
  app.controller("studentJobDetailController", jobDetailController);
  
});