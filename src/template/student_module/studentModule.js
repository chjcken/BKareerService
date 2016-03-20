/**
 * Created by trananhgien on 3/14/2016.
 */

define(['angular', 'ui-router', 'routeResolver'], function() {
    var basePath = 'student_module/';
    var student_module = angular.module('student_module', ['ui.router', 'routeResolverServices']);



    student_module.config(['$stateProvider', '$urlRouterProvider', 'routeResolverProvider',
        function($stateProvider, $urlRouterProvider, routeResolverProvider) {

            console.log('routeResolverObject \n', routeResolverProvider);
            // set views, controllers directorys
            routeResolverProvider.$get().routeConfig
                .setBaseDirectories(student_module + 'views', student_module + 'controllers');

            var router = routeResolverProvider.$get().route;

            $stateProvider

                .state('student', router({
                    baseName: 'home',
                    url: '/home'
                }));

    }]);

    return student_module;
});