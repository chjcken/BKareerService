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
        ngProgressFactory, myRouter, AuthService, utils, noti) {
    
    console.log("--APPLICATION-->");
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
      getNotis();
      longpolling();
    });

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(e, event) {
      event.preventDefault();
      Session.delete();
      $state.go('app.login');
      myRouter.init();
    });
    
    
    
    function getNotis() {
      if (AuthService.isAuthenticated()) {
      noti.getAllNotis()
       .then(function(res) {
          res = res.data;
          if (res.success !== 0) return alert("ERR: " + res.success);
          
          $scope.listNotis = renderNotis(res.data);
        });
      }
    }
    
    
    function renderNotis(listNotis) {
      var types = Object.keys(listNotis);
      var renderList = [];
      angular.forEach(types, function(type) {
        switch (type) {
          case "type_1": // suitable job
            renderList.push({
              title: "There " + (listNotis[type].length > 1 ? "are " : "is a ") + listNotis[type].length + " job suitable",
              url: "/#/dashboard/preference"
            });
            break;

          case "type_2": // anythings else
            break;

          default: 
            console.error("NOT FOUND NOTI TYPE=" + type);
            break;
        }
      });

      return renderList;
    }
    
    function longpolling() {
      if (AuthService.isAuthenticated()) {
        noti.getNoti()
          .then(function(res) {
             alert("long polling ");
             console.log("long polling--->",res);
             longpolling();
          });

      }
    }
    
        
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
    'utils',
    'notification'
  ];
  
  app.controller('applicationController', appController);

});