
define([
    'app'
  ],
  function(app) {
    
    function homeController(vm, Session) {
      console.log("---HomeController--->")
      vm.userRole = Session.getUserRole();
    }
    
    homeController.$inject = ["$scope", "Session"];
    app.controller("homeController", homeController);
});