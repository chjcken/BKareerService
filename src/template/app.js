// app.js

define(['angularAMD', 'angular', 'ui-router', 'AuthService'], function(angularAMD) {
    var app = angular.module('app', ['ui.router', 'servicesModule']);

    app.constant('USER_ROLES', {
        manager: 'MANAGER',
        student: 'STUDENT',
        agency: 'AGENCY'
    })
        .constant('AUTH_EVENTS', {
            loginSuccess: 'auth-login-success',
            loginFailed: 'auth-login-failed',
            logoutSuccess: 'auth-logout-success',
            sessionTimeout: 'auth-session-timeout',
            notAuthenticated: 'auth-not-authenticated',
            notAuthorized: 'auth-not-authorized'
        });

    app.config(function($stateProvider, $urlRouterProvider, routeResolverProvider) {

        $urlRouterProvider.when("", '/app/login');
        $urlRouterProvider.when("/", '/app/login');
        $urlRouterProvider.otherwise('app/login');

        var route = routeResolverProvider.route;

        routeResolverProvider.routeConfig.setBaseDirectories('app_module');
        $stateProvider
            .state('app', angularAMD.route({
                abstract: true,
                url: '/app',
                template: "<div ui-view></div>",
                controller: 'applicationController',
                onEnter: function() {
                    console.log('enter app');
                }
            }));

        // route for login module
        routeResolverProvider.routeConfig.setBaseDirectories('login_module');

        $stateProvider

            .state('app.login', route({
                url: '/login',
                baseName: 'login'
            }));

        routeResolverProvider.routeConfig.setBaseDirectories('student_module');


        // route for student module
        $stateProvider

            .state('app.student', route({
                url: '/student',
                path: 'home/',
                baseName: 'studentHome'
            }));

        // set directories for the others module
        routeResolverProvider.routeConfig.setBaseDirectories('agency_module');

    });

    app.run(['$rootScope', 'AuthService', 'AUTH_EVENTS', function($rootScope, AuthService, AUTH_EVENTS) {
        $rootScope.$on('$stateChangeStart', function(event, toState,  toParams, fromState, fromParams) {
            //console.log(toState, toParams, fromState, fromParams);
            if (!AuthService.isAuthenticated()) {
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            } else if (!AuthService.isAuthorizedRole){

            }

        });
    }]);



    return angularAMD.bootstrap(app);
});

