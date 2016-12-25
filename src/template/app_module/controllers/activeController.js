

define([], function() {

  function activeCtrl(vm, Session) {
    vm._setPageTitle("Activation Account");
    vm.isLogin = !!Session.getUserRole();

    vm.redirectLogin = function() {
      vm.logout();
    };
  }

  activeCtrl.$inject = ["$scope", "Session"];

  return activeCtrl;

});
