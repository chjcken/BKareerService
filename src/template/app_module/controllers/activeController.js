

define(['app'], function(app) {
  
  function activeCtrl(vm, Session) {
    vm.isLogin = !!Session.getUserRole();
    
    vm.redirectLogin = function() {
      vm.logout();
    };
  }
  
  activeCtrl.$inject = ["$scope", "Session"];
  
  app.controller('activeController', activeCtrl);
  
});