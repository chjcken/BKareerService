/*
 * student job detail controller
 */
define([
  
], function() {
  
  function jobDetailController(vm, $state, $stateParams, utils, jobService, notification) {
    var jobId = $stateParams.jobId;
    var notiId = $stateParams.notiid;
    if (notiId) notification.seenNoti(notiId).then(function() { $state.go("app.dashboard.job"); })
    
  }
  
  jobDetailController.$inject = ["$scope", "$state", "$stateParams", "utils", "jobService", "notification"];
  
  return jobDetailController;
  
});