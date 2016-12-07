
define([
    'app'
  ],
  function(app) {
    
    function homeController(vm, Session, USER_ROLES, noti) {
      vm.userRole = Session.getUserRole();
      
      var dropdownMenu = [];
      switch (Session.getUserRole()) {
        case USER_ROLES.student: 
          dropdownMenu = [
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/preference", icon: "fa fa-heart", title: "Preferences"},
            {url: "#/dashboard/profile", icon: "fa fa-pencil-square", title: "Profile"},
            {url: "#/dashboard/files", icon: "fa fa-file", title: "Files"}
          ];
          break;

        case USER_ROLES.agency:
          dropdownMenu = [
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/profile", icon: "fa fa-pencil-square", title: "Profile"},
            {url: "#/dashboard/files", icon: "fa fa-file", title: "Files"}
          ];
          break;

        case USER_ROLES.admin:
          dropdownMenu = [
            {url: "#/dashboard/statistic", icon: "fa fa-briefcase", title: "Statistic"},
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/job/request", icon: "fa fa-briefcase", title: "Job Request"},
            {url: "#/dashboard/criteria", icon: "fa fa-pencil-square", title: "Criteria"},
            {url: "#/dashboard/account-management", icon: "fa fa-users", title: "Account"}
          ];
          break;

        default:
          break;
      }
      
      vm.dropdownMenu = dropdownMenu;
    }
    
    homeController.$inject = ["$scope", "Session", "USER_ROLES", "notification"];
    app.controller("homeController", homeController);
});