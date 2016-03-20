/**
 * Created by trananhgien on 3/15/2016.
 */
define(['app'], function(app) {

    app.controller('applicationController', ['$scope', '$log', function($scope, $log) {
        $log.info('APPLICATION CTRL');

        $scope.name = 'asdfadf';
        $scope.setCurrentUser = function(user) {

        };

    }]);

});