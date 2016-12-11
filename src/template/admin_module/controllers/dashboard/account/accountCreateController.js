define([
  'app'
], function(app) {
  function accountCreate(vm, user, toaster) {
    
    
    vm.create = function() {
      user.addAgency(vm.email, vm.companyName)
        .then(function(res) {
          res = res.data;
          if (res.success !== 0) {
            return toaster.pop('error', "Can't create agency account");
          }
          
          toaster.pop('success', 'Success');
        });
    };
  }
  
  accountCreate.$inject = ['$scope', 'user', 'toaster'];
  app.controller('adminAccountCreateController', accountCreate);
});