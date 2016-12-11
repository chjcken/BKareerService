define([
  'app'
], function(app) {
  function errorCtrl(vm) {
    vm.message = "Active account failed, please login before active your accout!";
  }
  
  errorCtrl.$inject = ['$scope'];
  app.controller('errorController', errorCtrl);
});