// app.js

define(['angularAMD',
    'angular',
    'ui-router',
    'AuthService',
    'uiModule',
    'ngGallery',
    'jquery',
    'bootstrap'], function(angularAMD) {
    var app = angular.module('app', [ 'servicesModule', 'jkuri.gallery', 'uiModule']);
    var ngProgress;
    var pageRoute = 'home';
    
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
    app.run(['$rootScope', 'AuthService', 'AUTH_EVENTS', 'ngTableDefaults',
        function($rootScope, AuthService, AUTH_EVENTS, ngTableDefaults) {
            
        $rootScope.$on('$stateChangeStart', function(event, toState,  toParams, fromState, fromParams) {
            
            if (toState.name == 'app.login') return;
            if (!AuthService.isAuthenticated()) {
                console.log('not autho');
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, event);
            } else if (!AuthService.isAuthorizedRole){

            console.log("$stateChangeStart", fromParams, toParams);
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

