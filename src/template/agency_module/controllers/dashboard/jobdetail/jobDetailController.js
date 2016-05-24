/**
 * Created by trananhgien on 5/24/2016.
 */

define(['app'], function(app) {

    app.controller('agencyJobDetailController', function($scope, $stateParams) {

        var jobId = $stateParams.jobId;

        $scope.job = {
            title: 'Job title'
        }

        $scope.items = ['Item 1', 'Item 2', 'Item 3'];

        $scope.addItem = function() {
            var newItemNo = $scope.items.length + 1;
            $scope.items.push('Item ' + newItemNo);
        };

    });

});