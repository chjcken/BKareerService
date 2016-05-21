/**
 * Created by trananhgien on 3/13/2016.
 */

define(['servicesModule', 'angular'], function(servicesModule, angular) {

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
                        var unauth = res.data.unauth || false;
                        // if there is new session id
                        if (unauth || res.data.expire) {
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
    servicesModule.factory('jobService', ['$http' , '$filter', '$httpParamSerializerJQLike',
        function($http, $filter, $httpParamSerializerJQLike) {
        var self = {};
        
        /*
         * 
         * @param {type} 0 all, 1 intern, 2 normal
         * @returns {unresolved}
         */
        self.getAll = function(type) {
            var params = {q: 'getjobhome'};
            var data = {};
            if (type) {
                data.jobtype = type;
            } else {
                data.jobtype = 0;
            }
            
            //data = $httpParamSerializerJQLike(data);
            return $http.post(api, data, {
                params: params
                //headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })
                    .then(function(res) {
                        return res.data.data;
                    });
        };
        
        self.getApplied = function() {
            var params = {q: 'getappliedjob'};
            return $http.post(api, {}, {params: params});
        }
        
        self.get = function(jobId) {
            return $http.post(api, {}, {
                params: {q: 'getjobdetail', id: jobId}
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
                params: {q: 'applyjob'},
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
        };

        self.createJob = function(data) {
            data = $httpParamSerializerJQLike(data);
            return  $http({
          method: 'POST',
          url: api + '?q=createjob',
           headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          data: data
         
       }).then(function(){
            $scope.items = data;
       }).catch(function(e) {
        // alert("Error :: "+data);
       });
            
        };
        
        function middleCheck(res) {
            
        }
        
        return self;
    }]);

    servicesModule.factory('utils', ['$http', '$filter', '$q', '$rootScope',
        function($http, $filter, $q, $rootScope) {
        
        var locations = [], tags = [];
        
        var MultiRequests = (function() {
            var requests = [];
            function addReq(req) {
                requests.push(req);
            }
            
            function all() {
                return $q.all(requests);
            }
            
            function init() {
                requests = [];
            }
            
            function broadcast(event, success) {
                $rootScope.$broadcast(event, success);
            }
            
            function checkResponse(responses) {
                angular.forEach(responses, function(value) {
                   if (value.data.success === false) {
                       return false;
                   }
                });
                
                return true;
            }
            
            function doAllRequest(broadCastDone) {
                broadcast('LoadStart');
                var promise = all();
                return promise.then(function(datas) {
                    if (!checkResponse(datas)) { 
                        broadcast('LoadDone', false);
                        return getError();
                    }
                    console.log("datas", datas);
                    var result = [];
                    angular.forEach(datas, function(value, key) {
                        console.log("value", value);
                        result.push(value.data.data);
                    });
                    
                    broadcast('LoadDone', true);
                    console.log("reuslt", result);
                    return result;
                }, function(err) {
                    broadcast('LoadDone', false);
                    return {
                        error: 'Loi ket noi'
                    }
                });
                
                
            }
            
            
            
            return {
                init: init,
                addRequest: addReq,
                doAllRequest: doAllRequest
            };
        })();
        
        function getAllTags() {
            if (tags.length > 0) {
                return tags;
            }
            
            return $http.post(api, {}, {params: {q: 'gettags'}});
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
        
        function getLocations() {
            if (locations.length > 0) return locations;
            
            return $http.post(api, {}, {params: {q: 'getlocations'}});
                    
        }
        
        function getError(code) {
            return {
                error: 'Co loi xay ra'
            };
        }
        return {
            getTags: getAllTags,
            getListLocations: getListLocations,
            getFiles: getFiles,
            MultiRequests: MultiRequests,
            getLocations: getLocations
        };
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
    servicesModule.config(['myRouterProvider', '$httpProvider',
        function(myRouterProvider, $httpProvider) {
        myRouterProvider.init();    
        $httpProvider.interceptors.push('authHttpInterceptor');
        
    }]);

    servicesModule.run(['$http', '$httpParamSerializerJQLike', function($http, $httpParamSerializerJQLike) {
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        $http.defaults.transformRequest = function(data) {
            return $httpParamSerializerJQLike(data);
        };
    }])
    
});