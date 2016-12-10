/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app', 'directives/form-view-edit/form-view-edit.js'], function(app) {
  function studentProfileCtrl(vm, toaster, utils, user, toaster) {
    vm._dashboardSetTabName("profile");
    
    user.getCandidate().then(function(res) {
      if (res.data.success !== 0) {
        return toaster.pop("error", "ERR", res.data.success);
      }
      
      vm.profile = res.data.data;
    });
    
    vm.save = function(password) {
      vm.savingPromise = true;
      user.changePassword(password.currpwd, password.newpwd)
              .then(function(res) {
                vm.savingPromise = false;
                res = res.data;
                if (res.success !== 0) {
                  return toaster.pop('error', "Change password failed");
                }
                
                toaster.pop('success', "Change password successfully");
              });
    };
    
  }

  studentProfileCtrl.$inject = ['$scope', 'toaster', 'utils', 'user', 'toaster'];
  app.controller('studentProfileController', studentProfileCtrl);

  return studentProfileCtrl;
});
