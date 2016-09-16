/**
 * Created by trananhgien on 3/15/2016.
 */

define(['app', 'AuthService'], function(app) {

    app.controller('loginController', ['$scope', '$log', 'AuthService', '$state', 'USER_ROLES',
        function($scope, $log, AuthService, $state, USER_ROLES) {
        $log.info('LOGIN CTRL');
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function(credentials) {
            var result = AuthService.login(credentials.username, credentials.password);
            result.then(function(result) {
                if (result.error) {
                    alert(result.error);
                    return;
                }
                var role = result.toUpperCase();
                console.log("Current user", role);
                switch (role) {
                    case USER_ROLES.student:
                        $state.go('app.home.newjobs', {type: 'job'});
                        break;
                    case USER_ROLES.agency:
                        $state.go('app.home');
                        break;
                    case USER_ROLES.admin:
                      $state.go('app.home.dashboard.criteria');
                      break;
                        
                }

            }).catch(function(err) {

            });

        };

    }]);

});