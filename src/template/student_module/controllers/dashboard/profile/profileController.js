/**
 * Created by trananhgien on 8/15/2016.
 */

define([], function() {
  function studentProfileCtrl(vm, toaster, $state, user) {
    vm._dashboardSetTabName("profile");
    
    user.getCandidate().then(function(res) {
      if (res.data.success !== 0) {
        return toaster.pop("error", "ERR", res.data.success);
      }
      
      vm.profile = res.data.data;
    });
    
    vm.save = function(password) {
      if (password.newpwd !== password.renewpwd) {
        return toaster.pop("error", "New password must be match to retype password");
      }
      vm.savingPromise = true;
      user.changePassword(password.currpwd, password.newpwd)
              .then(function(res) {
                vm.savingPromise = false;
                res = res.data;
                if (res.success !== 0) {
                  return toaster.pop('error', "Change password failed");
                }
                
                toaster.pop('success', "Change password successfully");
                $state.go('app.dashboard.profile', {}, {location: true, notify: false, reload: true});
              });
    };
    
  }

  studentProfileCtrl.$inject = ['$scope', 'toaster', '$state', 'user'];
  
  return studentProfileCtrl;
});
