define([
  'app'
], function(app) {
  function accountCreate(vm, user) {
    
    
    vm.send = function() {
      
    };
  }
  
  accountCreate.$inject = ['$scope', 'user'];
  app.controller('adminAccountCreateController', accountCreate);
});