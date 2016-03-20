/**
 * Created by trananhgien on 3/13/2016.
 */

define(['servicesModule'], function(servicesModule) {

    servicesModule.service('Session', function() {
        this.create = function(sessionID, userID, userRole) {
            this.sessionID = sessionID;
            this.userID = userID;
            this.userRole = userRole;
        };

        this.destroy = function() {
            this.sessionID = null;
            this.userID = null;
            this.userRole = null;
        };
    });

    servicesModule.factory('AuthService', ['$q', '$http', '$timeout', 'Session', 'sha1',
        function($q, $http, $timeout, Session, sha1) {

        var authService = {};

        var credentials = {
            username: '',
            password: ''
        };

        authService.login = function(username, password) {
            credentials.username = username;
            credentials.password = sha1.hash(password);

            return $http
                .post('/api', credentials, {params: {q: 'login'}})
                .then(function(res) {
//                    Session.create(res.data.id, res.data.user.id, res.data.user.role);
                    
                    console.log(res);
                });
        };

        authService.isAuthenticated = function() {
            return !!Session.userID;
        };

        authService.isAuthorized = function(authorizedRoles) {
            if (!angular.isArray(authorizedRoles)) {
                authorizedRoles = [authorizedRoles];
            }

            return authService.isAuthenticated()
                && (authorizedRoles.indexOf(Session.userRole) !== -1);
        };


        // this functions used for testing
        authService.fakeLogin = function(username, pw) {
            console.log('fake login ' + sha1.hash(pw));
            var deferred = $q.defer();

            $timeout(function() {

                Session.create('ss001', 'std001', 'student');

                deferred.resolve({
                    userID: 'Gien',
                    userRole: 'student'
                });
            }, 2000);

            return deferred.promise;
        };

        authService.fakeIsAuthorizedRole = function() {
            return true;
        };

        return authService;
    }]);



});