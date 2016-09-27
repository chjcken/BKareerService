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
            if (locations.length > 0) return $q.when({data: locations});
            
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
        
        function containsObject(srcArr, obj, field) {
          if (!field) return srcArr.indexOf(obj);
          for (var i = 0; i < srcArr.length; i++) {
            
            if (srcArr[i][field] == obj) {
              console.log("containsObject ", obj, field, srcArr[i][field]);
              return i;
            }
          }
          
          return -1;
        }
        
        return {
            getTags: getAllTags,
            getLocations: getLocations,
            getFiles: getFiles,
            downloadFile: downloadFile,
            MultiRequests: MultiRequests,
            Request: Request,
            isSuccess: isSuccess,
            getError: getError,
            containsObject: containsObject
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
        
    servicesModule.factory('criteria', ['$http', 'utils', function($http, utils) {
      var self = {}, _scope, _options;
        var enumValueTypes = {
            TEXT: 0,
            NUMBER: 1,
            EMAIL: 2,
            RADIO: 3,
            CHECKBOX: 4,
            LOCATION: 5
        };

        function getValueType(type) {
            var types = ['text', 'number', 'email', 'password', 'file', 'select'];
            return types[type];
        }

        function create(scope, input, options) {
            _scope = scope;
            _options = options;
            createModelsProperties(input);
        }

        function createModelsProperties(configs) {
            if (configs.is_last) {
              var valueType = configs.data[0].value_type;
              if ( valueType == enumValueTypes.RADIO || valueType == enumValueTypes.CHECKBOX ) {
                createScopeAttrForSelect(configs);
              } else if ( valueType == enumValueTypes.LOCATION ) {
                createScopeAttrForLocation(configs);
              } else {
                createScopeAttrForInput(configs);
              }
            } else {
              for (var i = 0; i < configs.data.length; i++) {
                createModelsProperties(configs.data[i]);
              }
            }
        }

        function createScopeAttrForInput(config) {
          var obj = config.data[0],
              id = obj.id, value, oldValue = null;
          if (obj.data) {
            value = obj.value_type == enumValueTypes.NUMBER ? Number(obj.data.data) : obj.data.data;
            oldValue = value;
          }

          modelName = "model_" + id;
          _scope[modelName] = {
            id: id,
            value: value,
            value_type: obj.value_type,
            old_data: oldValue
          };
          obj.bind_model = modelName + ".value";
        }

        function createScopeAttrForSelect(config) {
            //   console.log("Create Select", config);
            var type = config.data[0].value_type;
            var attrStr = "model_" + config.id;
            var attrData = {
                    id: config.id,
                    value_type: type,
                    options: config.data,
                    old_data: null
                },
                isHasData = false;

            config.data.unshift({
              id: -1,
              name: "--Choose--",
              data: {id: -1, data: "-1"},
              value_type: 3
            });

            for (var i = 0; i < config.data.length; i++) {

              var dataObj = config.data[i];
              console.log("---Test---", dataObj);
                if (dataObj.data && dataObj.data.data == 1) {
                  isHasData = true;
                  attrData.value = dataObj;
                  attrData.old_data = {};
                  angular.copy(dataObj, attrData.old_data);
                  break;
                }
            }

            if (!isHasData) {
              attrData.value = config.data[0];
            }
            config.bind_model = attrStr + ".value";
            config.bind_options = attrStr + ".options";
            _scope[attrStr] = attrData;
        }
        
        function createScopeAttrForLocation(config) {
            var locations = _options.locations;
            var attrStr = "model_" + config.id;
            var attrData = {
              id: config.id,
              value_type: enumValueTypes.LOCATION,
              citis: locations,
              s_city: locations[0],
              s_dist: locations[0].districts[0],
              old_data: null
            };
            
            var dataObj = config.data[0];
            if (dataObj.data) {
              var location = getLocationFromString(dataObj.data.data, locations);
              if (location.city.id == -1 || location.dist.id == -1) {
                var locAll = {
                  id: -1,
                  name: 'All',
                  districts: [{id: -1, name: 'All'}]
                };
                for (var j = 0; j < locations.length; j++) {
                  locations[j].districts.unshift({
                    id: -1,
                    name: 'All'
                  });
                }

                locations.unshift(locAll);
//                attrData.citis = locations;
              }
              
              if (location.city.id == -1) {
                location.city = locations[0];
              }
              
              if(location.dist.id == -1) {
                location.dist = location.city.districts[0];
              }
              
              attrData.id = dataObj.data.id;
              attrData.old_data = dataObj.data.data;
              attrData.s_city = location.city;
              attrData.s_dist = location.dist;
            } else if ( _options.isAddDefaultLocation ) {
              
              var locAll = {
                id: -1,
                name: 'All',
                districts: [{id: -1, name: 'All'}]
              };
              for (var j = 0; j < locations.length; j++) {
                locations[j].districts.unshift({
                  id: -1,
                  name: 'All'
                });
              }
              
              locations.unshift(locAll);
              
              attrData.id = dataObj.id;
              attrData.s_city = locations[0];
              attrData.s_dist = locations[0].districts[0];
            }
                
            dataObj.bind_model_attr_1 = attrStr + "." + "s_city";
            dataObj.bind_model_attr_2 = attrStr + "." + "s_dist";
            dataObj.bind_options = attrStr + "." + "citis";
            
            _scope[attrStr] = attrData;
        }

        function createListData(scope) {
            var listAdd = [], listUpdate = [];
            for (var property in scope) {
                var index = property.indexOf("model_");
                if (scope.hasOwnProperty(property) && index > -1) {
                    var id = scope[property].id, data;
                    var type = scope[property].value_type;
                    var canPush = false;

                    if (type == enumValueTypes.RADIO ||  type == enumValueTypes.CHECKBOX) {
                        var dataObj = scope[property].value;

                        var oldData = scope[property].old_data;
                        if (oldData && dataObj.data.id != oldData.data.id) {
                          listUpdate.push({
                            id: oldData.data.id,
                            data: "0"
                          });
                          if (dataObj.data.id != -1) {
                            listUpdate.push({
                              id: dataObj.data.id,
                              data: "1"
                            });
                          }
                        } else if (!oldData && dataObj.id != -1) {
                          listAdd.push({
                            id: dataObj.id,
                            data: "1"
                          });
                        }
                    } else if ( type != enumValueTypes.LOCATION ) {
                      data = scope[property].value;
                      var oldData = scope[property].old_data;
                      console.log("New Loc", newLoc);
                      if (oldData && oldData != data) {
                        listUpdate.push({
                          id: id,
                          data: data + ""
                        });
                      } else if (!oldData && data) {
                        listAdd.push({
                          id: id,
                          data: data + ""
                        });
                      }
                    } else {
                      var newData = {
                        id: scope[property].id,
                        data: ""
                      };
                      var oldData = scope[property].old_data;
                      var newLoc = scope[property].s_city.id.toString() + "\t" + scope[property].s_dist.id.toString();
                      console.log("New Loc", newLoc);
                      newData.data = newLoc;
                      if ( oldData ) {
                        listUpdate.push(newData);
                      } else {
                        listAdd.push(newData);
                      }
                      
                    }

                }
            }

            return {updateList: listUpdate, addList: listAdd};
        }

        function convertToValue(src, type) {
          switch (type) {
            case enumValueTypes.NUMBER:
              return Number(src);
            
          }
          
          return src;
        }

        function convertToString(value, type) {
          return value + "";
        }
        
        function locationToString(city, dist) {
          return city + "\t" + dist;
        }
        
        function getLocationFromString(stringEncoded, locations) {
          var ids = stringEncoded.split("\t");
          console.log("----getLocationFromString-----", ids);
          var cityIndex = utils.containsObject(locations, ids[0], "id");
          console.log("cityIndex", cityIndex);
          var city = locations[cityIndex];
          
          if (cityIndex == -1) {
            city = {
              id: -1,
              name: 'All',
              districts: [{
                  id: -1,
                  name: 'All'
              }]
            };
          }
          
          var distIndex = utils.containsObject(city.districts, ids[1], "id");
          var dist = city.districts[distIndex];
          
          if (distIndex == -1) {
            dist = {
                id: -1,
                name: 'All'
            };
          }
          console.log("return value ", {city: city, dist: dist});
          return {city: city, dist: dist};
        }
        
        function addCriteria(arraySections) {
          return $http.post( api, {data: JSON.stringify(arraySections)}, {params: {q: 'addcriteria'}} );
        }
        
        function getAllCriteria() {
          return $http.post( api, {}, {params: {q: 'getallcriteria'}});
        }

        self.create = create;
        self.createListData = createListData;
        self.getValueType = getValueType;
        self.enumValueTypes = enumValueTypes;
        self.addCriteria = addCriteria;
        self.getAllCriteria = getAllCriteria;
        
        return self;

    }]);

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