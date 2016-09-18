/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app', 'directives/form-view-edit/form-view-edit.js'], function(app) {
  function studentProfileCtrl($scope, $http, createModels, $timeout, utils) {
    // $scope.setCurrentTabName('profile');
   console.log("studentProfileCtrl");
    $scope.cancel = function(event, variable) {
      console.log("run");
      event.stopPropagation();
      $scope[variable] = false;
    }

    var sampleData = {
      "name": "root",
      "data": [
  {
    "name": "Invidual Infor",
    "data": [
      {
        "name": "Japanese",
        "data": [
          {
            "name": "N2",
            "criteria_id": 332368549,
            "id": 331235131,
            "value_type": 3
          },
          {
            "name": "N3",
            "criteria_id": 332368549,
            "id": 331260869,
            "value_type": 3
          },
          {
            "name": "N1",
            "criteria_id": 332368549,
            "id": 331209394,
            "value_type": 3
          }
        ],
        "id": 332368549,
        "parent_id": 332316988,
        "is_last": true
      },
      {
        "name": "Age",
        "data": [
          {
            "name": "{{no_title}}",
            "criteria_id": 332342768,
            "id": 331183658,
            "value_type": 1
          }
        ],
        "id": 332342768,
        "parent_id": 332316988,
        "is_last": true
      }
    ],
    "id": 332316988,
    "parent_id": 329718359,
    "is_last": false
  },
  {
    "name": "Basic Skills",
    "data": [
      {
        "name": "Toefl",
        "data": [
          {
            "name": "{{no_title}}",
            "criteria_id": 332291209,
            "id": 331157923,
            "value_type": 1
          }
        ],
        "id": 332291209,
        "parent_id": 332239654,
        "is_last": true
      },
      {
        "name": "Toeic",
        "data": [
          {
            "name": "{{no_title}}",
            "criteria_id": 332265431,
            "id": 331132189,
            "value_type": 1
          }
        ],
        "id": 332265431,
        "parent_id": 332239654,
        "is_last": true
      },
      {
        "name": "Location",
        "data": [
          {
            "name": "{{no_title}}",
            "criteria_id": 331165431,
            "id": 331132089,
            "value_type": 5,
            "data": {
              "id": 331132123,
              "data": "-1\t-1"
            }
          }
        ],
        "id": 332265111,
        "parent_id": 332239214,
        "is_last": true
      }
    ],
    "id": 332239654,
    "parent_id": 329718359,
    "is_last": false
  }
]
    };
    
    var req = utils.Request.create(true);    
    req.addRequest(utils.getLocations());
//    req.addRequest(createModels.getAllCriteria());
    
    
    req.all().then(function(result) {
      if (result.error) {
        alert("Error " + result.error);
        return;
      }
      
      $scope.location = result[0];
      var criterias = sampleData;
      createModels.create($scope, criterias, {locations: $scope.location, isAddDefaultLocation: true});
      console.log("sampeData", sampleData);
      $scope.sections = criterias.data;
    }); 
    
    function send() {
      console.log("send", createModels.createListData($scope));
    }

    $scope.send = send;
    window.scope = $scope;
    
//    createModels.create($scope, sampleData);
//
//    $scope.config = sampleData.data;
    
    

  }

  studentProfileCtrl.$inject = ['$scope', '$http', 'criteria', '$timeout', 'utils'];
  app.controller('studentProfileController', studentProfileCtrl);

  return studentProfileCtrl;
});
