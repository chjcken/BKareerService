/**
 * Created by trananhgien on 3/15/2016.
 */

/**
 * Load scroll top directive and register application controller,
 * this is the main controller for all app and it is always present
 */
define(['app', 'servicesModule', 'directives/scroll-top/scroll-top.js'], function(app) {
  
  function appController($rootScope, 
        $scope, AUTH_EVENTS, Session, $state, USER_ROLES,
        ngProgressFactory, myRouter, AuthService, utils) {
    
    
    var ngProgress = ngProgressFactory.createInstance();
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
      if (success) {
          ngProgress.complete();
      } else {
          ngProgress.stop();
      }
    });

    $scope.$on('LoadStart', function(event) {
      ngProgress.start();
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(e, event) {
      event.preventDefault();
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
  }
      
  appController.$inject = [
    '$rootScope',
    '$scope',
    'AUTH_EVENTS',
    'Session',
    '$state',
    'USER_ROLES',
    'ngProgressFactory',
    'myRouter',
    'AuthService',
    'utils'
  ];
  
  app.controller('applicationController', appController);

});