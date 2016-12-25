/**
 * Created by trananhgien on 3/15/2016.
 */

define([

], function(app) {

    function loginCtrl($scope, $log, AuthService, $state, USER_ROLES, $rootScope, fbService, user, toaster, Session) {
      $scope.credentials = {
          username: '',
          password: ''
      };
      
      $scope.loginLoading = $scope.registerLoading = false;

      function loginWithPassword(credentials) {
          $scope.loginLoading = true;
          var result = AuthService.login(credentials.email, credentials.password);
          result.then(function(result) {
            $scope.loginLoading = false;
            redirect(result);
              
          }).catch(function(err) {
            $scope.loginLoading = false;
          });

      }
      
      function socialLogin(token, provider) {
        AuthService.socialLogin(token, provider)
                .then(function(result) {
                  redirect(result);
                });
      }
      
      function register(data) {
        var info = {
          name: data.firstname + " " + data.lastname,
          email: data.email,
          password: data.password
        };
        
        AuthService.studentRegister(info)
                .then(function(result) {
                  redirect(result);
                });
      }
      
      
      $scope.submit = function(data, type) {
        console.log("login data", data, type);
        if (type === "LOGIN") {
          loginWithPassword(data);

        } else if (type === "REGISTER") {
          register(data);
        }

      };

      $rootScope.$on('event:social-sign-in-success', function(event, userDetail) {
        console.log("---fblogin-->", userDetail);
        if (userDetail.provider === 'facebook') {
          return fbService.getLoginStatus()
                  .then(function(res) {
                    console.log("--userdetail-->", res);
                    var accessToken = res.authResponse.accessToken;
                    socialLogin(accessToken, "facebook");
                  });
        }
        
        return socialLogin(userDetail.token, 'google');
      });
      
      function redirect(result) {
        if (result.error) {
            return toaster.pop('error', 'Login failed');
        }

        var role = result.role.toUpperCase();
        switch (role) {
            case USER_ROLES.student:
              user.getCandidate().then(function(res2) {
                var profile = res2.data.data;
                Session.setName(profile.display_name);
              });
              $state.go('app.home.newjobs', {type: 'job'});
              break;
            case USER_ROLES.agency:
              switch (result.status) {
                case 0: //created
                  $state.go('app.dashboard.createprofile');
                  break;
                case 1: // active
                  $state.go('app.dashboard.job');
                  break;
                case 2: // banned
                  $state.go('app.home.message',{type: "banned"});
                  break;
                default: //
                  $state.go('app.dashboard.job');
              }
                
                break;
            case USER_ROLES.admin:
                $state.go('app.dashboard.statistic');
                break;
        }
      }
    }
    
    loginCtrl.$inject = ['$scope', '$log', 'AuthService', '$state', 'USER_ROLES', '$rootScope', 'fbService', 'user', 'toaster', 'Session'];

    return loginCtrl;
});