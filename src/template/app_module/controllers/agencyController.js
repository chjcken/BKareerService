define([
  'app',
  'directives/job-grid/job-grid'
], function(app) {
  function agencyCtrl(vm, user, jobService, $stateParams, utils, $timeout, $window) {
    // get profile info
    // get jobs
    var agencyId = $stateParams.id;
    var req = utils.Request.create(true);
    
    vm.coverSrc = "";
    
    req.addRequest(user.getAgency(agencyId));
    req.addRequest(jobService.getAgencyJobs(agencyId));
    
    req.all()
      .then(function(res) {
        if (res.error) {
          $timeout(function() {
            $window.location.reload();
          }, 5000);
          return toaster.pop('error', 'Something wrong, reload after 5s...');
        }
        
        vm.profile = res[0];
        vm.jobs = res[1].data;
        
        for (var i = 0; i < vm.profile.url_imgs.length; i++) {
          if (vm.profile.url_imgs[i]) {
            vm.coverSrc = vm.profile.url_imgs[i];
            break;
          }
        }
      });
      
  }
  
  agencyCtrl.$inject = ['$scope', 'user', 'jobService', '$stateParams', 'utils', '$timeout', '$window'];
  app.controller('agencyController', agencyCtrl);
});