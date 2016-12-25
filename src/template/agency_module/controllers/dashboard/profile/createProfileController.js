define([

], function() {
  function createProfile(vm, user, utils, toaster, $state, Session) {
    vm.companySizes = ["Startup 1-10", "Small 11-50", "Medium 51-150", "Big 151-300", "Huge 300+"];
    vm.companyTypes = ["Outsourcing", "Product"];
    vm.profile = {};
    vm.tags = [];
    var id;
    
    var req = utils.Request.create(true);
    req.addRequest(utils.getLocations());
    req.addRequest(utils.getTags());
    req.addRequest(user.getAgency());

    
    req.all().then(function(res) {
      vm.locations = res[0];
      vm.tags = res[1];
      console.log("tags", vm.tags);
      delete res[2].account;
      res[2].tech_stack = "[]";
      vm.profile = res[2];
      vm.profile.company_size = vm.companySizes[0];
      vm.profile.company_type = vm.companyTypes[0];
    });
    
    vm.save = function(data) {
      console.log("---save---", data);
      if (!validate(data)) return;
      vm.savePromise = user.updateProfile(data)
        .then(function(res) {
          res = res.data;
          if (res.success !== 0) {
            return toaster.pop('error', utils.getError(res.success).error);
          }
          
          toaster.pop('success', "Update Profile Successfully");
          Session.setUserStatus(1);
          $state.go('app.dashboard.jobCreate');
        });
    }
    
    function validate(data) {
      var errmsg = "";
      if (data.brief_desc.length < 100) {
        errmsg = "Brief Description is too short";
        return showError(errmsg);
      }
      
      if (!data.name) {
        return showError("Missing company name");
      }
      
      if (!data.file_logo) {
        return showError("Missing logo photo");
      }
      
      return true;
    }
    
    function showError(err) {
      toaster.pop('error', err);
    }
  }
  
  createProfile.$inject = ['$scope', 'user', 'utils', 'toaster', '$state', 'Session'];
  return createProfile;
});