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
            'AUTH_EVENTS',
            'Session',
            '$state',
            'ngProgressFactory',
            'myRouter',
            'AuthService',
            'utils',
            function($rootScope, 
            $scope, AUTH_EVENTS, Session, $state, 
            ngProgressFactory, myRouter, AuthService, utils) {
                //$log.info('APPLICATION CTRL');
                var ngProgress = ngProgressFactory.createInstance();
                
                $scope.setCurrentUser = function(user) {

                };
                
                $scope.logout = function() {
                    AuthService.logout()
                            .then(function(res) {
                                console.log("logout", res);
                                if (utils.isSuccess(res.data.success)) {
                                    Session.delete();
                                    myRouter.init();
                                    $state.go('app.login');
                                }
                            });
                }
                
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
                    Session.delete();
                    $state.go('app.login');
                    myRouter.init();
                });


                // bind global keypress event
                $(document).on('keydown', function(e) {
                    $rootScope.$broadcast('globalKeyDown', e.keyCode);
                });

                $(window).mousedown(function(e) {
                    $rootScope.$broadcast('globalMouseDown', e, this);
                });


            }]);

});