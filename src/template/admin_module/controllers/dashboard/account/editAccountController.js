define([
  'app',
  'directives/tab/tabset',
  'directives/view-create-profile/view-create-profile',
  'directives/form-view-edit/form-view-edit'
], function(app) {
  function editAccountCtrl(vm, user, $stateParams, jobService, utils, NgTableParams, toaster, criteria) {
    vm.accountType = $stateParams.type;
    var id = $stateParams.id;
    
    vm.currentTab = 0;
    vm.companySizes = ["Startup 1-10", "Small 11-50", "Medium 51-150", "Big 151-300", "Huge 300+"];
    vm.companyTypes = ["Outsourcing", "Product"];
    
    if (vm.accountType === 'agency') {
      vm.tableParams = new NgTableParams({count: 10});
      vm.loadingPromise = jobService.getAgencyJobs(id)
        .then(function(res) {
          res = res.data;
          vm.tableParams.settings({data: res.data.data});
          return true;
        });
      
      var req = utils.Request.create(true);
      req.addRequest(utils.getLocations());
      req.addRequest(utils.getTags());
      req.addRequest(user.getAgency(id));

      req.all().then(function(res) {
        vm.locations = res[0];
        vm.tags = res[1];
        delete res[2].account;
        vm.profile = res[2];
        vm.pageTitle = vm.profile.name;
      });
    } else {
      vm.loadingPromise =  user.getCandidate(id).then(function(res) {
        res = res.data;
        vm.profile = res.data;
        vm.pageTitle = 'Candidate "' + vm.profile.display_name + '"';
        return true;
      });
      
      criteria.getStudentCriteria(id).then(function (res) {
        res = res.data;
        var criterias = {name: "root", data: res.data};
        criteria.create(vm, criterias);
        vm.sections = criterias.data;
      });
    }
    
    vm.save = function(data) {
      console.log("---save---", data);
      data.agencyid = id;
      vm.savePromise = user.updateProfile(data)
        .then(function(res) {
          res = res.data;
          if (res.success !== 0) {
            return toaster.pop('error', utils.getError(res.success).error);
          }
          
          toaster.pop('success', "Update Profile Successfully");
        });
    }
  }
  
  editAccountCtrl.$inject = ['$scope', 'user', '$stateParams', 'jobService', 'utils', 'NgTableParams', 'toaster', 'criteria'];
  app.controller("adminEditAccountController", editAccountCtrl);
});