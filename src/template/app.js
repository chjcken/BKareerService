// app.js

define(['angularAMD',
    'angular',
    'ui-router',
    'AuthService',
    'uiModule',
    'servicesModule',
    'directiveModule',
    'ngGallery',
    'jquery',
    'bootstrap'], function(angularAMD) {
    var app = angular.module('app', [ 'servicesModule', 'app.directives', 'jkuri.gallery', 'uiModule']);

    app.config(['socialProvider', 'laddaProvider', function(socialProvider, laddaProvider) {
      socialProvider.setGoogleKey("173991077559-23i1rg2hiebpt5i9a9or5tjhborkasm3.apps.googleusercontent.com");
      socialProvider.setFbKey({appId: "1002529649862653", apiVersion: "v2.8"});

      laddaProvider.setOption({ /* optional */
        style: 'expand-right',
        spinnerSize: 35,
        spinnerColor: '#ffffff'
      });
    }]);

    app.constant('USER_ROLES', {
        admin: 'ADMIN',
        student: 'STUDENT',
        agency: 'AGENCY'
    });


    /**
     * Check student has authentication to route a set of specific pages
     */
    app.run(['$rootScope', 'AuthService', 'AUTH_EVENTS', 'ngTableDefaults', '$state', 'Session',
        function($rootScope, AuthService, AUTH_EVENTS, ngTableDefaults, $state, Session) {
        console.log("state change ---->");
        $rootScope.$on('$stateChangeStart', function(event, toState,  toParams, fromState, fromParams) {

            if (toState.name === 'app.login' && AuthService.isAuthenticated()) {
              console.log("from", fromState)
              if (fromState.name === "") {
                $state.go('app.home.newjobs({type: "jobs"})')
              }

              return event.preventDefault();
            }


            if (toState.name.indexOf('dashboard') > -1) {
              var canAccessDashboard = AuthService.isAuthenticated();
              canAccessDashboard = canAccessDashboard && Session.getUserStatus() === 1;
//              alert(canAccessDashboard);
              if (!canAccessDashboard)
                return $state.go('app.home.bannedmessage');
            }

            if (fromState.name === 'app.home.search'
                    && fromState.name === toState.name) {
                $rootScope.$broadcast('SearchState', toParams);

                event.preventDefault();
                return;
            }


        });

        // config ng-table
        configNgTable(ngTableDefaults);
    }]);

    function configNgTable(ngTableDefaults) {
        ngTableDefaults.params.count = 10;
        ngTableDefaults.settings.counts = [];
    }

    return angularAMD.bootstrap(app);
});
