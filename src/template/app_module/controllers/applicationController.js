/**
 * Created by trananhgien on 3/15/2016.
 */

/**
 * Load scroll top directive and register application controller,
 * this is the main controller for all app and it is always present
 */
define(['app', 'servicesModule', 'directives/scroll-top/scroll-top.js'], function(app) {

    app.controller('applicationController',
        ['$rootScope',
            '$scope',
            '$location',
            'AUTH_EVENTS',
            'Session',
            '$state',
            '$timeout',
            'ngProgressFactory',
            'myRouter',
            function($rootScope, $scope, $location, AUTH_EVENTS, Session, $state, $timeout, ngProgressFactory, myRouter) {
                //$log.info('APPLICATION CTRL');
                var ngProgress = ngProgressFactory.createInstance();
                
                $scope.name = 'asdfadf';
                $scope.setCurrentUser = function(user) {

                };
                
                $scope.logout = function() {
                    Session.delete();
                    $state.go('app.login');
                    myRouter.init();
                }

                //$timeout(function() {
                //    Session.delete();
                //}, 5000);
                
                $scope.$on('LoadDone', function(event, success) {
                    console.log('broadcast LoadDone');
                    if (success) {
                        ngProgress.complete();
                    } else {
                        ngProgress.stop();
                    }
                });
                
                $scope.$on('LoadStart', function(event) {
                    console.log('broadcast LoadStart');
                    ngProgress.start();
                });
                
                $scope.$on(AUTH_EVENTS.notAuthenticated, function(e, event) {
                    event.preventDefault();
                    console.log('broadcast');
                    window.location.href = '/';
                });

                /*$scope.$on(AUTH_EVENTS.sessionTimeout, function() {
                     console.log('Event: ' + AUTH_EVENTS.sessionTimeout);
                    $state.go('app.login');
                });*/

                // bind global keypress event
                $(document).on('keydown', function(e) {
                    $rootScope.$broadcast('globalKeyDown', e.keyCode);
                });

                $("body").mousedown(function(e) {
                    $rootScope.$broadcast('globalMouseDown', e, this);
                });


            }]);

});