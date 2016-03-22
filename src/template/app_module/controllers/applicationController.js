/**
 * Created by trananhgien on 3/15/2016.
 */
define(['app'], function(app) {

    app.controller('applicationController', ['$rootScope', '$scope', '$log', '$window',
        function($rootScope, $scope, $log, $window) {
        $log.info('APPLICATION CTRL');

        $scope.name = 'asdfadf';
        $scope.setCurrentUser = function(user) {

        };

        // bind global keypress event
        $(document).on('keydown', function(e) {
            $rootScope.$broadcast('globalKeyDown', e.keyCode);
        });

    }]);

});