/**
 * Created by trananhgien on 3/27/2016.
 */

define([
], function() {
    function advertisementController(vm, user, jobService, utils) {
      user.getAllAgencies().then(function(res) {
        res = res.data;
        var agency = res.data[utils.random(0, res.data.length)];
        user.getAgency(agency.id).then(function(res1) {
          res1 = res1.data;
          vm.agency = res1.data;
        });

        jobService.getAgencyJobs(agency.id)
                .then(function(res2) {
                  res2 = res2.data;
                  vm.jobs = res2.data.data;

                });
      });
    }

    advertisementController.$inject = ['$scope', 'user', 'jobService', 'utils'];
    return advertisementController;
});
