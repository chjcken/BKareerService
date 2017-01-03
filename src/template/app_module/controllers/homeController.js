
define([
  ],
  function() {

    function homeController(vm, Session, USER_ROLES, noti, utils, $state) {
      vm.userRole = Session.getUserStatus();
      if (Session.getName()) {
        vm.userName = Session.getName().split(" ")[0];
      }
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
            {url: "#/dashboard/job/create", icon: "fa fa-plus", title: "Post Job"}
          ];
          break;

        case USER_ROLES.admin:
          dropdownMenu = [
            {url: "#/dashboard/statistic", icon: "fa fa-briefcase", title: "Statistic"},
            {url: "#/dashboard/job", icon: "fa fa-briefcase", title: "Job"},
            {url: "#/dashboard/job/request", icon: "fa fa-briefcase", title: "Job Request"},
            {url: "#/dashboard/criteria", icon: "fa fa-pencil-square", title: "Criteria"},
            {url: "#/dashboard/account/management", icon: "fa fa-users", title: "Account"}
          ];
          break;

        default:
          break;
      }
      
      utils.getLocations(true).then(function(res) {
        res = res.data;
        vm.cities = res.data;
        console.log("home location", vm.cities);
      });
      
      vm.searchDropdown = function(params) {
        console.log("search dropdown", params);
        if (params.city === 'All') delete params.city;
        if (params.district === 'All') delete params.district;

        $state.go('app.home.search', params);
      };
      
      vm.dropdownMenu = dropdownMenu;
    }

    homeController.$inject = ["$scope", "Session", "USER_ROLES", "notification", "utils", "$state"];
    return homeController;
});
