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

    var sampleData = {
      "name": "root",
      "data": [
        {
          "id": 1,
          "name": "Basic Skills",
          "data": [
            {
              id: 11,
              "name": "Toeic",
              "is_last": true,
              "data": [
                {
                  id: 111,
                  "name": "score",
                  value_type: 1,
                  data: {
                    id: 1111,
                    data: "800"
                  }
                }
              ]
            },
            {
              "id": 2,
              "name": "Toefl",
              "is_last": true,
              "data": [
                {
                  id: 21,
                  "name": "score",
                  "value_type": 1
                }
              ]
            },
            {
              "id": 3,
              "name": "Japanese",
              "is_last": true,
              "data": [
                {
                  id: 31,
                  "name": "N1",
                  "value_type": 3,
                  data:{id: 311, data: "1"}
                },
                {
                  id: 32,
                  "name": "N2",
                  "value_type": 3,
                  data:{id: 312, data: "0"}
                }
              ]
            },
            {
              id: 4,
              "name": "Foreign Languages",
              "data": [
                {
                  id: 41,
                  "name": "English",
                  "data": [
                    {
                      id: 411,
                      "name": "Toeic",
                      "is_last": true,
                      data: [{
                        name: "score",
                        "value_type": 1,
                        id: 4111
                      }]
                    },
                    {
                      id: 412,
                      "name": "Toefl",
                      "is_last": true,
                      "data": [{
                        name: "score",
                        "value_type": 1,
                        "data": {
                          id: 41211,
                          data: "333"
                        },

                        id: 4121
                      }]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 5,
          "name": "Invidual Infor",
          "data": [
            {
              id: 51,
              "name": "Age",
              "is_last": true,
              "data": [{
                id: 511,
                name: "score",
                "value_type": 1
              }]
            }
          ]
        }
      ]
    };

    function send() {
      console.log("send", createModels.createListData($scope));
    }

    $scope.send = send;

    createModels.create($scope, sampleData);
    console.log("sampleData", sampleData);
    console.log("scope", $scope);
    $scope.config = sampleData.data;
    $scope.test = undefined;
    $scope.foo = function() {
      console.log($scope.test);
    };

    $scope.onSelectChange = function() {
      alert("SDF");
      console.log($scope['model_3'].value);
    };

  }

  studentProfileCtrl.$inject = ['$scope', '$http', 'criteria', '$timeout'];
  app.controller('studentProfileController', studentProfileCtrl);

  return studentProfileCtrl;
});
