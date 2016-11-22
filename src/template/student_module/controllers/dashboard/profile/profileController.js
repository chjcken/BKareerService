/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app', 'directives/form-view-edit/form-view-edit.js'], function(app) {
  function studentProfileCtrl(vm, $http, utils, user, toaster) {
    vm._dashboardSetTabName("profile");
    
    user.getCandidate().then(function(res) {
      if (res.data.success !== 0) {
        return toaster.pop("error", "ERR", res.data.success);
      }
      
      vm.profile = res.data.data;
    });
    
    vm.profile = {
      name: "Gien Tran",
      email: "giencntt@gmail.com",
      account_type: "social"
    };
    
  }

  studentProfileCtrl.$inject = ['$scope', '$http', 'utils', 'user', 'toaster'];
  app.controller('studentProfileController', studentProfileCtrl);

  return studentProfileCtrl;
});
