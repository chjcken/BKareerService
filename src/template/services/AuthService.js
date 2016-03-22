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

    servicesModule.service('sessionHttpInterceptor', function() {

    })

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
                    //Session.create(res.data.id, res.data.user.id, res.data.user.role);
                    return res.data;
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


    servicesModule.factory('searchService', ['$http', function($http) {

        var self = {};

        self.search = function(params) {
            var _params = {q: 'search'};
            if (params.tags) {
                _params.tags = params.tags;
            }

            if (params.text) {
                _params.text = params.text;
            }

            if (params.location.city) {
                _params.city = params.location.city;
            }

            if (params.location.district) {
                _params.district = params.location.district;
            }

            return $http.get('/api', {
                params: _params
            }).then(function(res) {
                return res.data;
            }).catch(function(e) {
                console.log('ERROR:', e)
            });
        };

        return self;

    }]);

});