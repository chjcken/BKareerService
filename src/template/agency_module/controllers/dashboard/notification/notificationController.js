
define([
  "app"
], function(app) {
  
  function notificationCtrl(vm, notification, utils, $stateParams, jobService) {
    var notiId = $stateParams.notiid;
    
    notification.seenNoti(notiId)
            .then(function() {
              notification.getAllNotis();
            });
    notification.getNotiWithId(notiId)
            .then(function(res) {
              if (!res) return;
              
              var noti = res.data.data;
              return noti;
            }).then(function (noti) {
              return jobService.get(noti.job_id).then(function(res) {res.data.data});
            }).then(function (job) {
              vm.job = job;
              
            });
  }
  
  notificationCtrl.$inject = ["$scope", "notification", "utils", "jobService"];
  
  app.controller("agencyNotificationController", notificationCtrl);
  
});