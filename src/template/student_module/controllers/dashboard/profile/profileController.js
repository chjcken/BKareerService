/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app', 'directives/form-view-edit/form-view-edit.js'], function(app) {
  function studentProfileCtrl(vm, $http, createModels, $timeout, utils) {
    vm._dashboardSetTabName("profile");
    
    vm.profile = {
      name: "Gien Tran",
      email: "giencntt@gmail.com",
      account_type: "social"
    };
    
  }

  studentProfileCtrl.$inject = ['$scope', '$http', 'criteria', '$timeout', 'utils'];
  app.controller('studentProfileController', studentProfileCtrl);

  return studentProfileCtrl;
});
