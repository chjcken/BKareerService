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
            //token: '',
            userRole: ''
        });

        this.create = function(userRole) {
            userRole = userRole.toUpperCase();
            //storage.token = token;
            storage.userRole = userRole;
            deferred.resolve(userRole);
        };

        this.loadRole = function() {
            return deferred.promise;
        };

        this.getToken = function() {
            //return storage.token;
        };

        this.getUserRole = function() {

            return storage.userRole;
        };

        this.setToken = function(token) {
            //storage.token = token;
        };

        this.delete = function() {
            storage.$reset({
                //token: '',
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
                   
                        return config;
                    },

                    response: function(res) {
                        res.data.unauth = res.data.unauth || false;
                        // if there is new session id
                        if (res.data.unauth || res.data.expire) {
                            Session.delete();
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
                        if (res.data.success) {
                            if (res.data.role) {
                                Session.create(res.data.role);
                                return res.data.role.toUpperCase();
                            } else {
                                console.log('ERROR: Login response', res.data);
                            }
                        }

                        return false;

                    });
            };

            authService.isAuthenticated = function() {
                console.log('AuthService', Session.getUserRole());
                return Session.getUserRole() !== '';
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
                url: api,
                params: {q: 'apply'},
                headers: {
                    'Content-Type': undefined
                },
                data: data,
                transformRequest: function(data, headersGetter) {
              
                    var formData = new FormData();
                    angular.forEach(data, function(value, key) {
                        formData.append(key, value);
                    });

                    return formData;
                }
            });

            return promise;
        }

        self.postJob = function(data) {

        }
        
        return self;
    }]);

    servicesModule.factory('utils', ['$http', '$filter', function($http, $filter) {
        var locations = [
            {
                city: 'Ho Chi Minh',
                districts: ['Phu Nhuan', 'Go Vap', 'Binh Tan', 'Tan Phu', 'Thu Duc', 'Phu My Hung',
                'District 1', 'District 2', 'District 3', 'District 4', 'District 5', 'District 6',
                    'District 7', 'District 8', 'District 9', 'District 10', 'District 11', 'District 12'
                ]
            },
            {
                city: 'Ha Noi',
                districts: ['Cau Giay', 'Dong Da', 'Hai Ba Trung', 'Thanh Xuan', 'Hoan Kiem', 'Ba Dinh',
                    'Tay Ho', 'Nam Tu Liem', 'Hoang Mai', 'Ha Dong', 'Long Bien', 'Bac Tu Liem', 'Dong Anh',
                    'Thanh Tri', 'Gia Lam', 'Soc Son'
                ]
            },
            {
                city: 'Da Nang',
                districts: ['Hai Chau', 'Thanh Khe', 'Son Tra', 'Ngu Hanh Son', 'Lien Chieu', 'Hoa Vang',
                    'Hoang Sa', 'Cam Le'
                ]
            }
        ];

        function getAllTags() {
            return $http.get(api, {params: {q: 'gettags'}})
                .then(function(res) {
                    return res.data.data;
                });
        }

        function getListLocations() {
            return locations;
        }

        function getFiles() {
            return $http.get(api, {params: {q: 'getfiles'}})
                .then(function(res){
                    if (res.data.success) {
                        var files = res.data.data;
                        for (var i = 0; i < files.length; i++) {
                            files[i].url = buildFileUrl(files[i].id, files[i].name);
                            files[i].upload_date = $filter('date')(files[i].upload_date);
                        }
                        return files;
                    }

                    return {
                        error: 'Error'
                    }
                });
        }
        
        function buildFileUrl(id, name) {
            return 'dl/' + id + "/" + name;
        }

        return {
            getAllTags: getAllTags,
            getListLocations: getListLocations,
            getFiles: getFiles
        }
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