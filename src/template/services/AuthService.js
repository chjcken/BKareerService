/**
 * Created by trananhgien on 3/13/2016.
 */

define(['servicesModule'], function(servicesModule) {

    var api = '/api';

    servicesModule.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    servicesModule.service('Session', function($q, $localStorage) {
        var deferred = $q.defer();
        var storage = $localStorage.$default({
            token: '',
            userRole: ''
        });

        this.create = function(token, userRole) {
            userRole = userRole.toUpperCase();
            storage.token = token;
            storage.userRole = userRole;
            deferred.resolve(userRole);
        };

        this.loadRole = function() {
            return deferred.promise;
        };

        this.getToken = function() {
            return storage.token;
        };

        this.getUserRole = function() {

            return storage.userRole;
        };

        this.setToken = function(token) {
            storage.token = token;
        };

        this.delete = function() {
            storage.$reset({
                token: '',
                userRole: ''
            });

            console.log('session reset');
        };

    });

    servicesModule.service('authHttpInterceptor',
        [   '$rootScope',
            'Session',
            'AUTH_EVENTS',
            function($rootScope, Session, AUTH_EVENTS) {
                return {
                    request: function(config) {
                        // Add session id to params
                        var params = config.params || {q: ''};
                        var q = params.q || '';

                        if (!config.headers['Authorization'] && (q != 'login') ) {
                            var token = Session.getToken();
                            config.headers['Authorization'] = token;
                        }

                        return config;
                    },

                    response: function(res) {

                        // if there is new session id
                        if (res.data.token) {
                            Session.setToken(res.data.token);
                        }

                        // TODO: a check expiration session message from server to display popup login form
                        // This help user to remain current page
                        return res;
                    }
                };
    }]);

    /**
     * AuthService is responsible for authentication and authorization.
     */
    servicesModule.factory('AuthService', ['$q', '$http', '$timeout', 'Session', 'sha1',
        function($q, $http, $timeout, Session, sha1) {

            var authService = {};

            var credentials = {
                username: '',
                password: ''
            };

                /**
                 * Login method, it makes a post request to server
                 * @param username
                 * @param password The plain password
                 * @returns Promise
                 */
            authService.login = function(username, password) {
                credentials.username = username;
                credentials.password = sha1.hash(password);

                return $http
                    .post('/api', credentials, {params: {q: 'login'}})
                    .then(function(res) {
                        console.log(res);
                        if (res.data.success && res.data.token) {
                            if (res.data.role) {
                                Session.create(res.data.token, res.data.role);
                                return res.data.role.toUpperCase();
                            } else {
                                console.log('ERROR: Login response', res.data);
                            }
                        }

                        return false;

                    });
            };

            authService.isAuthenticated = function() {
                console.log('AuthService', Session.getToken());
                return Session.getToken() != '';
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
                    var role = '';
                    if (username == 'agency') {
                        Session.create('ss02', 'AGENCY');
                        role = 'AGENCY';
                    }

                    if (username == 'student') {
                        Session.create('ss001', 'STUDENT');
                        role = 'STUDENT';
                    }


                    deferred.resolve({
                        userID: 'Gien',
                        userRole: role
                    });
                }, 2000);

                return deferred.promise;
            };

            authService.fakeIsAuthorizedRole = function() {
                return true;
            };

            authService.updateToken = function(token) {
                token = token || Session.getToken();

                if (!token) {
                    alert("TOKEN NOT FOUND");
                    return;
                }

                $http.defaults.headers.common.Authorization = token;
                Session.setToken(token);
            }


        return authService;
    }]);

    /**
     * SearchService make a get request to server with key searching
     */
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

        self.ajax = function(text) {
            return $http.get('api', {
                params: {
                    q: 'ajax-search',
                    value: text
                }
            }).then(function(res) {

                return res.data;

            }).catch(function(e) {});
        };

        return self;

    }]);

    /**
     * Job service, get, create
     */
    servicesModule.factory('jobService', ['$http' , '$filter', function($http, $filter) {
        var self = {};
        var normalize = $filter('htmlToPlainText');

        self.getAll = function(type) {
            var params = {q: 'jobhome'};
            if (type) {
                params.type = true;
            }
            
            return $http.post(api,{}, {params: {q: 'jobhome'}})
                    .then(function(res) {
                        return res.data.data;
                    });
        };
        
        self.get = function(jobId) {
            return $http.post(api, {}, {
                params: {q: 'jobdetail', id: jobId}
            }).then(function(res) {
                return res.data.data;
            }).catch(function(e) {
                console.log(e);
            });
        };

        self.apply = function(data) {
            var data = data || {};
            if (!data.file_id || !data.file_upload) {
                
            }
            
            var promise = $http({
                method: 'POST',
                url: api + '?q=apply',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                data: data,
                transformRequest: function(data, headersGetter) {
                    var formData = new FormData();
                    angular.forEach(data, function(value, key) {
                        formData.append(key, value);
                    });

                    var headers = headersGetter();
                    delete headers['Content-Type'];

                    return formData;
                }
            });

            return promise;
        }

        self.postJob = function(data) {

        }
        
        return self;
    }]);

    servicesModule.filter('html', ['$sce', function($sce) {
        return function(input) {
            return $sce.trustAsHtml(input);
        };
    }])
        .filter('htmlToPlainText', function () {
            return function (text) {
                return text ? String(text).replace(/<[^>]+>/gm, '') : '';
            };
        })
        .filter('subStringByWord', function() {
            return function (text, number) {
                if (typeof text !== 'string') return "";

                return text.split(/\s+/).splice(0, Math.min(number, text.length)).join(" ");
            };
        });

    // UI
    servicesModule.service('fileUpload', function($http) {
        this.uploadFileToUrl = function(file, url) {
            url = url || '/api';
            var fd = new FormData();
            fd.append('file', file);
            return $http.post(url, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined},
                params: {q: 'upload'}
            });
        }
    });

    servicesModule.config(function($httpProvider) {

        $httpProvider.interceptors.push('authHttpInterceptor');
    });
});