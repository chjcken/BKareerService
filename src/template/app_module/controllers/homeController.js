
define([
    'app'
  ],
  function(app) {
    
    function homeController(vm, Session, USER_ROLES) {
      console.log("---HomeController--->")
      vm.userRole = Session.getUserRole();
      
      var dropdownMenu = [];
      console.log("---userRole-->", Session.getUserRole());
      switch (Session.getUserRole()) {
        case USER_ROLES.student: 
          dropdownMenu = [
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/preference", icon: "fa fa-heart", title: "Preferences"},
            {url: "#/dashboard/profile", icon: "fa fa-pencil-square", title: "Profile"},
            {url: "#/dashboard/inbox", icon: "fa fa-envelope-o", title: "Inbox"},
            {url: "#/dashboard/files", icon: "fa fa-file", title: "Files"}
          ];
          break;

        case USER_ROLES.agency:
          dropdownMenu = [
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/profile", icon: "fa fa-pencil-square", title: "Profile"},
            {url: "#/dashboard/inbox", icon: "fa fa-envelope-o", title: "Inbox"},
            {url: "#/dashboard/files", icon: "fa fa-file", title: "Files"}
          ];
          break;

        case USER_ROLES.admin:
          dropdownMenu = [
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/agencies", icon: "fa fa-pencil-square", title: "Profile"},
            {url: "#/dashboard/inbox", icon: "fa fa-envelope-o", title: "Inbox"},
          ];
          break;

        default:
          break;
      }
      
      vm.dropdownMenu = dropdownMenu;
    }
    
    homeController.$inject = ["$scope", "Session", "USER_ROLES"];
    app.controller("homeController", homeController);
});