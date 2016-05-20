// app.js

define(['angularAMD',
    'angular',
    'ui-router',
    'AuthService',
    'uiModule',
    'ngGallery',
    'jquery',
    'bootstrap'], function(angularAMD) {
    var app = angular.module('app', ['ui.router', 'servicesModule', 'jkuri.gallery', 'uiModule']);
    var ngProgress;
    var pageRoute = 'home';

    app.constant('USER_ROLES', {
        manager: 'MANAGER',
        student: 'STUDENT',
        agency: 'AGENCY'
    });

    app.config(function($stateProvider, $urlRouterProvider, routeResolverProvider, SessionProvider) {

        $urlRouterProvider.when("", "/login");
        $urlRouterProvider.when("/", "/login");
        $urlRouterProvider.when("/dashboard", "/dashboard/job");
        $urlRouterProvider.otherwise("/login");

        var route = routeResolverProvider.route;

        routeResolverProvider.routeConfig.setBaseDirectories('app_module');
        $stateProvider
            .state('app', angularAMD.route({
                abstract: true,
                url: '/app',
                template: "<div ui-view></div><scroll-top></scroll-top>",
                controller: 'applicationController',
                controllerProvider: 'applicationController',
                onEnter: function() {
                    console.log('enter app');
                }
            }));
        // route for login module
        routeResolverProvider.routeConfig.setBaseDirectories('login_module');

        $stateProvider

            .state('app.login', route({
                url: '^/login',
                baseName: 'login'
            }));

        routeResolverProvider.routeConfig.setBaseDirectories('student_module');

        // route for home, dashboard controller, which must be load dynamically
        $stateProvider

            .state('app.home', getRoute({
                url: '^/home',
                page: 'home',
                resolve: {
                    check: function(Session, $location) {
                        if (Session.getUserRole() == '') {
                            $location.path('/');
                        }
                    }
                },
            }))
            .state('app.home.dashboard', getRoute({
                abstract: true,
                url: '^/dashboard',
                page: 'dashboard'

            }))
            .state('app.home.dashboard.profile', getRoute({
                url: '/profile',
                page: 'profile',
                path: 'dashboard/'
            }))
            .state('app.home.dashboard.job', getRoute({
                url: '/job',
                page: 'job',
                path: 'dashboard/'
            }))
            .state('app.home.dashboard.job.create', getRoute({
                url: '/create',
                page: 'job',
                path: 'dashboard/'
            }))
            .state('app.home.dashboard.internship', getRoute({
                url: '/internship',
                page: 'internship',
                path: 'dashboard/'
            }))
            .state('app.home.dashboard.preference', getRoute({
                url: '/preference',
                page: 'preference',
                path: 'dashboard/'
            }))
            .state('app.home.dashboard.files', getRoute({
                url: '/files',
                page: 'file',
                path: 'dashboard/'
            }));
            //.state('app.home.dashboard.profile', getRoute('/', 'profile'));

        routeResolverProvider.routeConfig.setBaseDirectories('app_module');
        $stateProvider
            .state('app.home.search', route({
                url: '^/search?tags&text&city&district',
                baseName: 'search',
                params: {tags: {array: true}},
                viewsControllerUrl: ['app_module/controllers/searchController',
                                        'app_module/controllers/advertisementController'],
                views: {
                    '': {
                        templateUrl: 'app_module/views/search.html',
                        controller: 'searchController'
                    },
                    'ads@app.home.search': {
                        templateUrl: 'app_module/views/advertisement.html',
                        controller: 'advertisementController'
                    }
                }
            }))

            .state('app.home.newjobs', route({
                url: '^/new-jobs/:type',
                baseName: 'newJobs'
            }))

            .state('app.home.job', route({
                url: '^/job/{jobId}',
                baseName: 'job'
            }));


        routeResolverProvider.routeConfig.setBaseDirectories('student_module');

        $stateProvider
            .state('app.home.job.application', route({
                url: '/application',
                baseName: 'application',
                path: 'application/'
            }));

        // set directories for the others module
        routeResolverProvider.routeConfig.setBaseDirectories('agency_module');



    });

    /**
     * Check student has authentication to route a set of specific pages
     */
    app.run(['$rootScope', 'AuthService', 'AUTH_EVENTS', 'ngProgressFactory',
        function($rootScope, AuthService, AUTH_EVENTS, ngProgressFactory) {
            
        ngProgress = ngProgress || ngProgressFactory.createInstance();
        $rootScope.$on('$stateChangeStart', function(event, toState,  toParams, fromState, fromParams) {
            
            ngProgress.start();
            
            if (toState.name == 'app.login') return;
            if (!AuthService.isAuthenticated()) {
                console.log('not autho');
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated, event);
            } else if (!AuthService.isAuthorizedRole){

            }

        });
        
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            ngProgress.complete();
        });
    }]);


    /**
     * Get template url base on role
     * @param pRole User's role
     * @returns string Template URL
     */
    function getFile(pRole, USER_ROLES, page, isCtrl, path) {
        console.log('get file func', pRole);
        var pRole = pRole.toUpperCase();
        var file = isCtrl ? page + 'Controller' : page + '.html';
        var cv = isCtrl ? 'controllers/' : 'views/';
        path = path || '';

        switch (pRole) {
            case USER_ROLES.student:
                return 'student_module/' + cv + path + page + '/' + file;

            case USER_ROLES.agency:
                return 'agency_module/' + cv + path + page + '/' + file;

            case USER_ROLES.manager:
                return 'manager_module/views/home/manager' + page + '.html';

            default:
                return 'student_module/' + cv + path + page + '/' + file;
                break;
        }
    }

    function getController(pRole, USER_ROLES, page, path) {
        return getFile(pRole, USER_ROLES, page, true, path);
    }

    function getTemplate(pRole, USER_ROLES, page, path) {
        return getFile(pRole, USER_ROLES, page, false, path);
    }

    function getControllerProvider(pRole, USER_ROLES, page) {
        page = page.firstCapitalize();
        switch (pRole.toUpperCase()) {
            case USER_ROLES.student:
                return 'student' + page + 'Controller';

            case USER_ROLES.agency:
                return 'agency' + page + 'Controller';

            case USER_ROLES.manager:
                return 'manager' + page + 'Controller';

            default:
                return 'student' + page + 'Controller';
                break;
        }

    }

    function getRoute(config) {
        console.log('getRoute', config.page);
        config.abstract = config.abstract || false;
        config.template = config.template || undefined;

        return angularAMD.route({
            abstract: config.abstract,
            url: config.url,
            template: config.template,
            templateProvider: function(Session, USER_ROLES, $stateParams, $templateFactory, $templateCache) {
                var role = Session.getUserRole();
                // If role has been set, we return it immediately

                if (role != '') {

                }
                return $templateFactory.fromUrl(getTemplate(role, USER_ROLES, config.page, config.path));
                // else we return promise for the first time
                return Session.loadRole().then(function(roleResolved) {
                    return $templateFactory.fromUrl(getTemplate(roleResolved, USER_ROLES, config.page, config.path));
                });
            },
            controllerUrl: function (Session, USER_ROLES) {
                return getController(Session.getUserRole(), USER_ROLES, config.page, config.path);
            },
            controllerProvider: function (Session, USER_ROLES) {
                return getControllerProvider(Session.getUserRole(), USER_ROLES, config.page.firstCapitalize());
                //return 'studentHomeController';
            },
            resolve: config.resolve
        });
    }

    return angularAMD.bootstrap(app);
});

