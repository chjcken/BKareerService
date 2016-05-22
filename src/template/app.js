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

    app.constant('USER_ROLES', {
        manager: 'MANAGER',
        student: 'STUDENT',
        agency: 'AGENCY'
    });

 
    /**
     * Check student has authentication to route a set of specific pages
     */
    app.run(['$rootScope', 'AuthService', 'AUTH_EVENTS',
        function($rootScope, AuthService, AUTH_EVENTS) {
            
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
        
    }]);


    

    return angularAMD.bootstrap(app);
});

