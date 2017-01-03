/**
 * Created by trananhgien on 3/14/2016.
 */

/**
 * require sha1 module that defines angular-sha1 module and sha1 factory
 */

define(['angularAMD', 'angular', 'ui-router', 'sha1', 'ngStorage'], function(angularAMD) {
    
    var routeConfig = function() {
        var viewsDirectory = '/views/',
            controllersDirectory = '/controllers/',
            moduleDirectory = '';

        setBaseDirectories = function(moduleDir, viewsDir, controllersDir) {
            viewsDirectory = viewsDir || viewsDirectory;
            controllersDirectory = controllersDir || controllersDirectory;
            moduleDirectory = moduleDir;
        };

        getViewsDirectory = function() {
            return viewsDirectory;
        };

        getControllersDirectory = function() {
            return controllersDirectory;
        };

        getModuleDirectory = function() {
            return moduleDirectory;
        };

        return {
            setBaseDirectories: setBaseDirectories,
            getControllersDirectory: getControllersDirectory,
            getViewsDirectory: getViewsDirectory,
            getModuleDirectory: getModuleDirectory
        };
    }();

    var route = function(routeObj) {
        if (!routeObj.path) routeObj.path='';

        var routeDef = {};

        routeDef.templateUrl = routeConfig.getModuleDirectory() + routeConfig.getViewsDirectory()
            + routeObj.path + routeObj.baseName + '.html';

        // if route state has views config, we will use routeObj.viewsControllerUrl array for load all view's controllers
        routeDef.controllerUrl = routeObj.viewsControllerUrl ? routeObj.viewsControllerUrl : routeConfig.getModuleDirectory() + routeConfig.getControllersDirectory()
            + routeObj.path + routeObj.baseName + 'Controller';
        routeDef.controller = routeObj.baseName + 'Controller';
        routeDef.secure = routeObj.secure ? routeObj.secure : false;
        routeDef.abstract = routeObj.abstract ? routeObj.abstract : false;
        routeDef.params = routeObj.params ? routeObj.params : {};
        routeDef.url = routeObj.url;
        routeDef.views = routeObj.views;
        routeDef.resolve = routeObj.resolve;

        return routeDef;
    };

    var routeResolver = function() {
        return {
            $get: function() {

            },
            routeConfig: routeConfig,
            route: route
        };
    };

    var myRouter = function($stateProvider, $urlRouterProvider, routeResolverProvider) {
        var init = function () {
        $stateProvider.init();
        $urlRouterProvider.init();

        $urlRouterProvider.when("/register", "/register/candidate");
        $urlRouterProvider.when("", "/new-jobs/job");
        $urlRouterProvider.when("/", "/new-jobs/job");
        $urlRouterProvider.when("/dashboard", "/dashboard/job");
        $urlRouterProvider.otherwise("/new-jobs/job");

        var route = routeResolverProvider.route;

        routeResolverProvider.routeConfig.setBaseDirectories('app_module');
        $stateProvider
            .state('app', route({
                abstract: true,
                url: '/app',
                baseName: 'application',
                resolve: {
                    load: ['$rootScope', '$q', 'USER_ROLES', 'Session',
                        function($rootScope, $q, USER_ROLES, Session) {
                          return loadModule($rootScope, $q, Session.getUserRole(), USER_ROLES);
                        }
                    ]
                }
            }))
            .state('app.login', route({
              url: '^/login',
              baseName: 'login'
              
            }))
            .state('app.home', route({
                abstract: true,
                url: '^/home',
                baseName: 'home',
                resolve: {
                  load: ['$rootScope', '$q', 'USER_ROLES', 'Session',
                    function ($rootScope, $q, USER_ROLES, Session) {
                      return loadModule($rootScope, $q, Session.getUserRole(), USER_ROLES);
                    }
                  ]
                }
            }))

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
                baseName: 'newJobs',
                viewsControllerUrl: ['app_module/controllers/newJobsController',
                                        'app_module/controllers/advertisementController'],
                views: {
                    '': {
                        templateUrl: 'app_module/views/newJobs.html',
                        controller: 'newJobsController'
                    },
                    'ads@app.home.newjobs': {
                        templateUrl: 'app_module/views/advertisement.html',
                        controller: 'advertisementController'
                    }
                }
            }))

            .state('app.home.job', route({
                url: '^/job/{jobId}',
                baseName: 'job'
            }))

            .state('app.home.agency', route({
                url: '^/agency/{id}',
                baseName: 'agency',
                viewsControllerUrl: ['app_module/controllers/agencyController', 'app_module/controllers/advertisementController'],
                views: {
                    '': {
                        templateUrl: 'app_module/views/agency.html',
                        controller: 'agencyController'
                    },
                    'ads@app.home.agency': {
                        templateUrl: 'app_module/views/advertisement.html',
                        controller: 'advertisementController'
                    }
                }
            }))

            .state('app.home.agencies', route({
              url: '^/agencies',
              baseName: 'popularAgency'
            }))

            .state('app.home.register', route({
              url: '^/register/{user:candidate|agency}',
              baseName: 'register'
            }))

            .state('app.home.activeaccount', route({
              url: '^/active-account',
              baseName: 'active'
            }))

            .state('app.home.error', route({
              url: '^/error/:type',
              baseName: 'error'
            }))

            .state('app.home.message', route({
              url: '^/message/:type',
              baseName: 'message'
            }));


        // route for login module
//        routeResolverProvider.routeConfig.setBaseDirectories('account_module');
//
//        $stateProvider
//
//          .state('app.login', route({
//              url: '^/login',
//              baseName: 'login'
//          }));



        routeResolverProvider.routeConfig.setBaseDirectories('student_module');
        // route for home, dashboard controller, which must be load dynamically
        $stateProvider

            .state('app.dashboard', getRoute({
                abstract: true,
                url: '^/dashboard',
                page: 'dashboard',
                path: 'dashboard/',
                resolve: {
                  load: ['$rootScope', '$q', 'USER_ROLES', 'Session',
                    function ($rootScope, $q, USER_ROLES, Session) {
                      return loadModule($rootScope, $q, Session.getUserRole(), USER_ROLES);
                    }
                  ]
                }
            }))
            .state('app.dashboard.profile', getRoute({
                url: '/profile',
                page: 'profile',
                path: 'dashboard/profile/'
            }))
            .state('app.dashboard.createprofile', getRoute({
                url: '/profile/create',
                page: 'createProfile',
                path: 'dashboard/profile/'
            }))
            .state('app.dashboard.job', getRoute({
                url: '/job',
                page: 'job',
                path: 'dashboard/job/'
            }))
            .state('app.dashboard.jobrequest', getRoute({
                url: '/job/{status: request}',
                page: 'job',
                path: 'dashboard/job/'
            }))
            .state('app.dashboard.jobdetail', getRoute({
                url: '/job/{jobId:[0-9]+}?notiid&notitype',
                page: 'jobDetail',
                path: 'dashboard/job/'
            }))
            .state('app.dashboard.jobCreate', getRoute({
                url: '/job/create',
                page: 'jobCreate',
                path: 'dashboard/job/'
            }))
            .state('app.dashboard.internship', getRoute({
                url: '/internship',
                page: 'internship',
                path: 'dashboard/internship/'
            }))
            .state('app.dashboard.preference', getRoute({
                url: '/preference?notiid',
                page: 'preference',
                path: 'dashboard/preference/'
            }))
            .state('app.dashboard.files', getRoute({
                url: '/files',
                page: 'file',
                path: 'dashboard/file/'
            }))

            .state('app.dashboard.criteria', getRoute({
                url: '/criteria',
                page: 'criteria',
                path: 'dashboard/criteria/'
            }))

            .state('app.dashboard.statistic', getRoute({
                url: '/statistic',
                page: 'statistic',
                path: 'dashboard/statistic/'
            }))

            .state('app.dashboard.accountmanagement', getRoute({
                url: '/account/management?keyword&usertype',
                page: 'accountManagement',
                path: 'dashboard/account/'
            }))

            .state('app.dashboard.accountcreate', getRoute({
                url: '/account/create',
                page: 'accountCreate',
                path: 'dashboard/account/'
            }))

            .state('app.dashboard.editaccount', getRoute({
                url: '/account/{type:string}/{id:int}',
                page: 'editAccount',
                path: 'dashboard/account/'
            }))
            
            .state('app.home.job.application', getRoute({
                url: '/application',
                page: 'application',
                path: 'application/',
                resolve: {
                  load: ['$rootScope', '$q', 'USER_ROLES', 'Session',
                    function ($rootScope, $q, USER_ROLES, Session) {
                      return loadModule($rootScope, $q, Session.getUserRole(), USER_ROLES);
                    }
                  ]
                }
            }));


//        routeResolverProvider.routeConfig.setBaseDirectories('student_module');
//
//        $stateProvider
//            .state('app.home.job.application', route({
//                url: '/application',
//                baseName: 'application',
//                path: 'application/'
//            }));

        // set directories for the others module
        routeResolverProvider.routeConfig.setBaseDirectories('agency_module');

        };
        return {
            $get: function() {
                return {init: init}
            },
            init: init
        }
    }

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
                return 'student_module/' + cv + path + file;

            case USER_ROLES.agency:
                return 'agency_module/' + cv + path  + file;

            case USER_ROLES.admin:
                return 'admin_module/' + cv + path + file;

            default:
                return 'student_module/' + cv + path + file;
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

            case USER_ROLES.admin:
                return 'admin' + page + 'Controller';

            default:
                return 'student' + page + 'Controller';
                break;
        }

    }

    function getRoute(config) {
        console.log('getRoute', config.page);
        config.abstract = config.abstract || false;
        config.template = config.template || undefined;

        return {
            abstract: config.abstract,
            url: config.url,
            template: config.template,
            templateProvider: ['Session', 'USER_ROLES', '$stateParams', '$templateFactory', '$templateCache', function(Session, USER_ROLES, $stateParams, $templateFactory, $templateCache) {
                var role = Session.getUserRole();
                // If role has been set, we return it immediately

                if (role != '') {

                }
                return $templateFactory.fromUrl(getTemplate(role, USER_ROLES, config.page, config.path));
                // else we return promise for the first time
                return Session.loadRole().then(function(roleResolved) {
                    return $templateFactory.fromUrl(getTemplate(roleResolved, USER_ROLES, config.page, config.path));
                });
            }],
            controllerUrl: ['Session', 'USER_ROLES', function (Session, USER_ROLES) {
                return getController(Session.getUserRole(), USER_ROLES, config.page, config.path);
            }],
            controllerProvider: ['Session', 'USER_ROLES', function (Session, USER_ROLES) {
                return getControllerProvider(Session.getUserRole(), USER_ROLES, config.page.firstCapitalize());
                //return 'studentHomeController';
            }],
            resolve: config.resolve
        };
    }

    function loadModule($rootScope, $q, role, USER_ROLES) {
        var moduleName = '';
        switch (role) {
            case USER_ROLES.student:
                moduleName = 'candidateModule';
                break;

            case USER_ROLES.agency:
                moduleName = 'agencyModule';
                break;

            case USER_ROLES.admin:
                moduleName = 'adminModule';
                break;

            default :
                return $q.when(true);
        }
        console.log("YEP", moduleName);
        var defered = $q.defer();
        require(['dist/' + moduleName + '.min.js'], function() {

            defered.resolve();
            $rootScope.$apply();
        });

        return defered.promise;
    }

    myRouter.$inject = ['$stateProvider', '$urlRouterProvider', 'routeResolverProvider'];

    var servicesApp = angular.module('servicesModule', ['ui.router', 'angular-sha1', 'ngStorage']);

    servicesApp.provider('routeResolver', routeResolver);
    servicesApp.provider('myRouter', myRouter);



    return servicesApp;
});
