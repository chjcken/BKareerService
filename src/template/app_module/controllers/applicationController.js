/**
 * Created by trananhgien on 3/15/2016.
 */

/**
 * Load scroll top directive and register application controller,
 * this is the main controller for all app and it is always present
 */
define(['app', 'directives/scroll-top/scroll-top.js'], function(app) {

    app.controller('applicationController',
        ['$rootScope',
            '$scope',
            '$log',
            'AUTH_EVENTS',
            'Session',
            '$state',
            '$timeout',
            function($rootScope, $scope, $log, AUTH_EVENTS, Session, $state, $timeout) {
                $log.info('APPLICATION CTRL');

                $scope.name = 'asdfadf';
                $scope.setCurrentUser = function(user) {

                };
                
                $scope.logout = function() {
                    Session.delete();
                    $state.go('app.login');
                }

                //$timeout(function() {
                //    Session.delete();
                //}, 5000);

                $scope.$on(AUTH_EVENTS.notAuthenticated, function(e, event) {
                    event.preventDefault();
                    console.log('broadcast');
                    $state.go('app.login');
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