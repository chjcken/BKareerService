define([
], function() {
  function agencyCtrl(vm, user, jobService, $stateParams, utils, $timeout, $window, searchService) {
    // get profile info
    // get jobs
    var agencyId = $stateParams.id;
    var req = utils.Request.create(true);

    vm.coverSrc = "";
    vm.isNoJob = false;

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
        vm.profile.tech_stack = JSON.parse(vm.profile.tech_stack);
        console.log("ag", vm.profile.tech_stack);        
        
        if (!res[1].data.length) {
          vm.isNoJob = true;
          searchService.search({tags: vm.profile.tech_stack, limit: 5})
                  .then(function(resp) {
                    resp = resp.data;
                    vm.jobs = resp.data.data;
                  });
        } else {
          vm.jobs = res[1].data;
        }

        for (var i = 0; i < vm.profile.url_imgs.length; i++) {
          if (vm.profile.url_imgs[i] && vm.profile.url_imgs[i] !== "https://itviec.com/assets/missing.png") {
            vm.coverSrc = vm.profile.url_imgs[i];
            break;
          }
        }
      });

  }

  agencyCtrl.$inject = ['$scope', 'user', 'jobService', '$stateParams', 'utils', '$timeout', '$window', 'searchService'];
  return agencyCtrl;
});
