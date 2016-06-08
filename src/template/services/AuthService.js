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
    servicesModule.factory('AuthService', ['$q', '$http', '$timeout', 'Session', 'sha1', 'utils',
        function($q, $http, $timeout, Session, sha1, utils) {

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
                        if (utils.isSuccess(res.data.success)) {
                            if (res.data.role) {
                                Session.create(res.data.role);
                                return res.data.role.toUpperCase();
                            } else {
                                console.log('ERROR: Login response', res.data);
                            }
                        }

                        return utils.getError(res.data.success);

                    });
            };
            authService.logout = function () {
                return $http.post(api, {}, {params: {q: 'logout'}});
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
            var _params = {};
            
            if (params.tags) {
                _params.tags = params.tags;
            }

            if (params.text) {
                _params.text = params.text;
            }

            if (params.city) {
                _params.city = params.city;
            }

            if (params.district) {
                _params.district = params.district;
            }
            console.log("params", params);
            return $http.post('/api', _params, {params: {q: 'searchjob'}})
                    .then(function(res) {
                        return res;
                    }).catch(function(e) {
                        console.log('ERROR:', e);
                    });
        };

        return self;

    }]);

    /**
     * Job service, get, create
     */
    servicesModule.factory('jobService', ['$http' , '$filter',
        function($http, $filter) {
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
            
            return $http.post(api, data, {
                params: params
            });
        };
        
        self.getApplied = function() {
            var params = {q: 'getappliedjobs'};
            return $http.post(api, {}, {params: params});
        }
        
        self.get = function(jobId) {
            return $http.post(api, {jobid: jobId}, {
                params: {q: 'getjobdetail'}
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
            return $http.post(api, data, {params: {q: 'createjob'}});
        };
        
        self.getStudentApplied = function(jobId) {
            
        };
        
        self.getAgencyJobs = function() {
            return $http.post(api, {}, {params: {q: 'getagencyjob'}});
        }
        
        self.getApplyDetail = function(data) {
            return $http.post(api, data, {params: {q: 'getapplydetail'}});
        };
        
        self.deny = function(data) {
            return $http.post(api, data, {params: {q: 'denyjob'}});
        };
        
        self.approve = function(data) {
            return $http.post(api, data, {params: {q: 'approvejob'}});
        };
        
        return self;
    }]);

    servicesModule.factory('utils', ['$http', '$filter', '$q', '$rootScope',
        function($http, $filter, $q, $rootScope) {
        
        var locations = [], tags = [];
        
        var MultiRequests = function() {
            var requests = [], isBroadcast = true;
            
            this.addRequest = function addReq(req) {
                requests.push(req);
            }
            
            function all(broadcast) {
                return $q.all(requests);
            }
            
            this.init = function(broadcast) {
                requests = [];
                isBroadcast = broadcast === undefined ? isBroadcast : broadcast;
            }
            
            function broadcast(event, success) {
                if (isBroadcast) $rootScope.$broadcast(event, success);
            }
            
            function checkResponse(responses) {
                console.log("response", responses);
                for(var i = 0; i < responses.length; i++) {
                    var value = responses[i];
                    var success = value.data.success;;
                 
                    
                    if (!isSuccess(success)) {
                        return false;
                    }
                }
                
                
                return true;
            }
            
            this.all = function doAllRequest() {
                broadcast('LoadStart');
                var promise = all();
                return promise.then(function(datas) {
                    if (!checkResponse(datas)) { 
                        broadcast('LoadDone', false);
                        console.log("CHECK FAIL", datas);
                        return getError(datas[0].data.success);
                    }
                    
                    var result = [];
                    angular.forEach(datas, function(value, key) {
                        result.push(value.data.data);
                    });
                    
                    broadcast('LoadDone', true);
                    return result;
                }, function(err) {
                    broadcast('LoadDone', false);
                    return {
                        error: 'Loi ket noi'
                    };
                });
                
            }
        };
        
        var Request = {
            create: function(broadcast) {
                var req = new MultiRequests();
                req.init(broadcast);
                return req;
            }
        };
        
        function getAllTags() {
            if (tags.length > 0) {
                return $q.when(tags);
            }
            
            return $http.post(api, {}, {params: {q: 'gettags'}});
        }

        function getFiles() {
            return $http.post(api, {}, {params: {q: 'getfiles'}})
                .then(function(res){
                    if (isSuccess(res.data.success)) {
                        var files = res.data.data;
                        for (var i = 0; i < files.length; i++) {
                            files[i].url = buildFileUrl(files[i].id, files[i].name);
                            files[i].upload_date = $filter('date')(files[i].upload_date);
                        }
                        return files;
                    }

                    return getError(res.data.success);
                });
        }
        
        function downloadFile(file) {
            return $http.get(buildFileUrl(file.id, file.name));
        }
        
        function buildFileUrl(id, name) {
            return 'dl/' + id + "/" + name;
        }
        
        function getLocations() {
            if (locations.length > 0) return $q.when(locations);
            
            return $http.post(api, {}, {params: {q: 'getlocations'}});
                    
        }
        
        function getError(code) {
            var msg = '';
            switch (code) {
                case -1: msg = 'database error';
                    break;
                case -2: msg = 'invalid param';
                    break;
                case -3: msg = 'access denied';
                    break;
                case -4: msg = 'exist';
                    break;
                case -5: msg = 'not exist';
                    break;
                case -6: msg = 'system error';
            }
            
            return {error: msg};
        }
        
        function isSuccess(code) {
            return code >= 0;
        }
        
        return {
            getTags: getAllTags,
            getLocations: getLocations,
            getFiles: getFiles,
            downloadFile: downloadFile,
            MultiRequests: MultiRequests,
            Request: Request,
            isSuccess: isSuccess,
            getError: getError
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