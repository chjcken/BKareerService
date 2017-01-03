/**
 * Created by trananhgien on 3/15/2016.
 */

/**
 * Load scroll top directive and register application controller,
 * this is the main controller for all app and it is always present
 */
define([

], function() {

  function appController($rootScope,
        $scope, AUTH_EVENTS, Session, $state, USER_ROLES,
        ngProgressFactory, myRouter, AuthService, utils, noti, toaster) {
    var notiStore = [];
    var mapNotiState = [];
    var ngProgress = ngProgressFactory.createInstance();
    $scope.isLoadDone = true;
    
    if (Session.getUserStatus() === 1) {
      getNotis();
      longpolling();
    }
    
    $scope.logout = function() {
      AuthService.logout()
        .then(function(res) {
            console.log("logout", res);
            if (utils.isSuccess(res.data.success)) {
              noti.cancelLongPolling();
              noti.clearNotiCache();
                Session.delete();
                myRouter.init();
                $state.go('app.login');
            }
        });
    }

    $scope.$on('LoadDone', function(event, success) {
      $scope.isLoadDone = true;
      if (success) {
          ngProgress.complete();
      } else {
          ngProgress.stop();
      }
    });

    $scope.$on('LoadStart', function(event) {
      $scope.isLoadDone = false;
      ngProgress.start();
      console.log("user status", Session.getUserStatus());
      if (Session.getUserStatus() !== 1) return;

      getNotis();
      longpolling();
    });
    

    $scope.$on(AUTH_EVENTS.notAuthenticated, function(e, event) {
      event.preventDefault();
      Session.delete();
      $state.go('app.login');
      myRouter.init();
    });

    $scope.$on('SeenNoti', function(event) {
      // update noti
      console.log("update noti");
      getNotis();
    });
    
    

    function getNotis() {
      if (AuthService.isAuthenticated()) {
        noti.getAllNotis()
         .then(function(res) {
            res = res.data;
            if (res.success !== 0) return console.log("ERR: " + res.success);
            notiStore = res.data;
            $scope.listNotis = renderNotis(notiStore);
          });
      }
    }


    function renderNotis(listNotis) {
      var renderList = [];
      angular.forEach(listNotis, function(n) {
        var notiItem = getNotiItem(n);
        if (notiItem) {
          renderList.push(notiItem);
        }
      });

      return renderList;
    }

    function longpolling() {
      if (AuthService.isAuthenticated()) {
        var notiPromise = noti.getNoti();
        if (!notiPromise) return;
          notiPromise.then(function(res) {
            if (!res) return;
            longpolling();

            var noti = res.data.data
            if (res.data.success !== 0) {
              return console.error("ERR: " + res.success);
            }

            notiStore.push(noti);
            $scope.listNotis = renderNotis(notiStore);
            var notiItem = getNotiItem(noti);
            if (notiItem) {
              toaster.pop({
                type: 'success',
                title: 'Notification',
                body: 'noti-item',
                bodyOutputType: 'directive',
                directiveData: notiItem
              });
              
              if (noti.type === 1) {
                $rootScope.$broadcast('FindJobNoti', {notiid: noti.id});
              }

             if (noti.type === 0) {
               $rootScope.$broadcast('FindCandidateNoti', {notiid: noti.id, notitype: 'candidate', jobId: noti.data.job_id});
              }
            }
          });

      }
    }

    function getNotiItem(n) {
      var notiItem;
      switch (n.type) {
          case 0:
            if (n.data.data.length === 0) return;
            notiItem = {
              title: "There " + (n.data.data.length > 1 ? "are " : "is a ") + n.data.data.length + " candidate(s) suitable",
              url: "/#/dashboard/job/" + n.data.job_id + "?notitype=candidate&notiid=" + n.id
            };
            break;
          case 1: // suitable job
            notiItem =  {
              title: "There " + (n.data.length > 1 ? "are " : "is a ") + n.data.length + " job suitable",
              url: "/#/dashboard/preference?notiid=" + n.id
            };
            break;
          case 2: // approve
            notiItem =  {
              title: "You have a job has just been approved",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            }; 
            break;

          case 3: // denied
            notiItem =  {
              title: "Opps, a job has just been denied",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            };
            break;
          case 4: // job request apply
            notiItem =  {
              title: "A new request apply job",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            };
            break;
          case 5: // job request active
            notiItem =  {
              title: "A new job need be reviewed",
              url: "/#/dashboard/job/" + n.data.job_id + "?notiid=" + n.id
            };
            break;
          case 6: // job edited
            notiItem =  {
              title: "A job has just been edited by admin",
              url: "/#/dashboard/job/" + n.data.job_id + "?notitype=jobedited&notiid=" + n.id
            };
            break;
          default:
            console.error("NOT FOUND NOTI TYPE=" + n.type);
            break;
        }
                                
        return notiItem;
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
    'notification',
    'toaster'
  ];

  return appController;
});
