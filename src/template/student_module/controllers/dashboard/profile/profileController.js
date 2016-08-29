/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app', 'directives/form-view-edit/form-view-edit.js'], function(app) {
  function studentProfileCtrl($scope, $http, createModels, $timeout) {
    // $scope.setCurrentTabName('profile');
    console.log("studentProfileCtrl");
    $scope.cancel = function(event, variable) {
      console.log("run");
      event.stopPropagation();
      $scope[variable] = false;
    }

    $timeout(function() {
      var config = {
       "success" : 0,
       "data" : [
         {
           "id": 1234,
           "name": "Basic Skill",
           "data": [
             {
               "id": 787,
               "name": "Foreign Language",
               "data": [
                 {
                   "id": 98,
                   "name": "English",
                   "is_last": true,
                   "data": [
                     {
                       "id": 54634,
                       "name": "Toeic",
                       "data": {
                         "id": 11110,
                         "data": 800
                       },
                       "type": 0,
                       "bind_model": "toeicMark"
                     },
                     {
                       "id": 54634,
                       "name": "IELS",
                       "data": {
                         "id": 11111,
                         "data": 800
                       },
                       "type": 0,
                       "bind_model": "ielsMark"
                     },

                   ]
                 },
                 {
                   "id": 98,
                   "name": "France",
                   "is_last": true,
                   "data": [
                     {
                       "id": 54634,
                       "name": "Bang 1",
                       "data": {
                         "id": 22220,
                         "data": 900
                       },
                       "type": 0,
                       "bind_model": "franceFirst"
                     },
                     {
                       "id": 54634,
                       "name": "Bang 2",
                       "data": {
                         "id": 22221,
                         "data": 800
                       },
                       "type": 0,
                       "bind_model": "franceSecond"
                     }

                   ]

                 }
               ]
             }
           ]
         },
         {
           "id": 1234,
           "name": "Basic Skill",
           "data": [
             {
               "id": 787,
               "name": "Foreign Language 2",
               "data": [
                 {
                   "id": 98,
                   "name": "English",
                   "is_last": true,
                   "data": [
                     {
                       "id": 54634,
                       "name": "Toeic",
                       "data": {
                         "id": 33330,
                         "data": 800
                       },
                       "type": 0,
                       "bind_model": "toeicFirst"
                     },
                     {
                       "id": 54634,
                       "name": "IELS",
                       "data": {
                         "id": 33331,
                         "data": 400
                       },
                       "type": 0,
                       "bind_model": "toeicSecond"
                     }
                   ]
                 },
                 {
                   "id": 98,
                   "name": "France",
                   "is_last": true,
                   "data": [
                     {
                       "id": 54634,
                       "name": "Bang 1",
                       "data": {
                         "id": 44440,
                         "data": 900
                       },
                       "type": 0,
                       "bind_model": "franceFirstSecond"
                     },
                     {
                       "id": 54634,
                       "name": "Bang 2",
                       "data": {
                         "id": 44441,
                         "data": 800
                       },
                       "type": 0,
                       "bind_model": "franceSecondSecond"
                     }
                   ]
                 }
               ]
             }
           ]
         }
       ]
      };
      // config = config.data;
      createModels($scope, config);
      console.log("config", config);
      $scope.config = config.data;
    }, 1000);

  }

  studentProfileCtrl.$inject = ['$scope', '$http', 'createModels', '$timeout'];
  app.controller('studentProfileController', studentProfileCtrl);

  return studentProfileCtrl;
});
