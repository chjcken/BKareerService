/**
 * Created by trananhgien on 3/15/2016.
 */

define(['app', 'AuthService'], function(app) {

    app.controller('loginController', ['$scope', '$log', 'AuthService', '$state',
        function($scope, $log, AuthService, $state) {
        $log.info('LOGIN CTRL');
        $scope.credentials = {
            username: '',
            password: ''
        };

        $scope.login = function(credentials) {
            var result = AuthService.login(credentials.username, credentials.password);
            result.then(function(data) {	
				
				if (data.success) {
					$state.go('app.student');
				} else {
					alert('Login Failed. Try again');
				}

            }).catch(function(err) {

            });

        };

    }]);

});