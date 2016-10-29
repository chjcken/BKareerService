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
    var notiStore = [];
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
          notiStore = res.data;
          $scope.listNotis = renderNotis(notiStore);
        });
      }
    }
    
    
    function renderNotis(listNotis) {
      var renderList = [];
      angular.forEach(listNotis, function(n) {
        switch (n.type) {
          case 0:
            renderList.push({
              title: "There " + (n.data.length > 1 ? "are " : "is a ") + n.data.length + " candidate(s) suitable",
              url: "/#/dashboard/preference?notiid=" + n.id
            });
            break;
          case 1: // suitable job
            renderList.push({
              title: "There " + (n.data.length > 1 ? "are " : "is a ") + n.data.length + " job(s) suitable",
              url: "/#/dashboard/job/" + 11111 + "?notiid=" + n.id
            });
            break;

          case 2: // approve
            renderList.push({
              title: "You have a job has just been approved",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            });
            break;
            
          case 3: // denied
            renderList.push({
              title: "Opps, a job has just been denied",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            });
            break; 
          
          case 4: // job request apply
            renderList.push({
              title: "A new request apply job",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            });
            break;
            
          default: 
            console.error("NOT FOUND NOTI TYPE=" + n.type);
            break;
        }
      });

      return renderList;
    }
    
    function longpolling() {
      if (AuthService.isAuthenticated()) {
        noti.getNoti()
          .then(function(res) {
            if (!res) return;
            longpolling();
            alert("long polling ");
            console.log("long polling--->",res);
       
            var noti = res.data.data
            if (res.data.success !== 0) {
              return alert("ERR: " + res.success);
            }
             
            notiStore.push(noti);
            $scope.listNotis = renderNotis(notiStore);
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