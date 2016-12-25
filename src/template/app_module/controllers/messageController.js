define([
], function() {
  function messageCtrl(vm, $stateParams) {
    vm.message = "Your account was banned, please contact us if you want to know more information";
    vm.message = $stateParams.type === 'new-account' ? "Please active your account" : vm.message;
  }

  messageCtrl.$inject = ['$scope', '$stateParams'];
  return messageCtrl;
});
