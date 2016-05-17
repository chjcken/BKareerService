/**
 * Created by trananhgien on 3/15/2016.
 */
define(['app',
    'directives/job-grid/job-grid.js',
    'directives/search-bar/search-bar.js',
    'AuthService'],
    function(app) {

        app.controller('studentHomeController', function($scope, $log, $state, Session, USER_ROLES) {


            /**
             * Get search result from server and update model "jobs"
             * @param params Object {tags: [], text: '', location: {city: '', district: ''}}
             */
            $scope.doSearch = function(params) {

                $state.go('app.student.search', params);
            };

            $scope.isStudent = Session.getUserRole().toUpperCase() == USER_ROLES.student;

            console.log('USER_ROLE', Session.getUserRole().toUpperCase());
        });

});