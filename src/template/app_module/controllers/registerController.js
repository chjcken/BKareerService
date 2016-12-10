define([
  'app'
], function(app) {
  function register(vm, user, utils, $stateParams) {
    vm.userType = $stateParams.user;
    vm.company = {};
    utils.getLocations().then(function(res) {
      res = res.data;
      vm.locations = res.data;
      vm.company.city = vm.locations[0];
    });
  }
  
  register.$inject = ['$scope', 'user', 'utils', '$stateParams'];
  app.controller('registerController', register);
});