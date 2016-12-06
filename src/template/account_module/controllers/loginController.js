/**
 * Created by trananhgien on 3/15/2016.
 */

define([
  'app',
  'AuthService',
  'directives/login-form/login-form'
], function(app) {

    function loginCtrl($scope, $log, AuthService, $state, USER_ROLES, $rootScope, fbService, $timeout) {
      $log.info('LOGIN CTRL');
      $scope.credentials = {
          username: '',
          password: ''
      };
      
      $scope.loginLoading = $scope.registerLoading = false;

      function loginWithPassword(credentials) {
          $scope.loginLoading = true;
          var result = AuthService.login(credentials.email, credentials.password);
          result.then(function(result) {
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
            alert(result.error);
            return;
        }

        var role = result.toUpperCase();
        switch (role) {
            case USER_ROLES.student:
                $state.go('app.home.newjobs', {type: 'job'});
                break;
            case USER_ROLES.agency:
                $state.go('app.dashboard.job');
                break;
            case USER_ROLES.admin:
                $state.go('app.dashboard.statistic');
                break;
        }
      }
    }
    
    loginCtrl.$inject = ['$scope', '$log', 'AuthService', '$state', 'USER_ROLES', '$rootScope', 'fbService', '$timeout'];

    app.controller('loginController', loginCtrl);
});