/**
 * Created by trananhgien on 3/15/2016.
 */
define(['app',
    'directives/job-grid/job-grid.js',
    'directives/search-bar/search-bar.js',
    'AuthService'],
    function(app) {

        app.controller('agencyHomeController', function($scope, $log, $state, Session, USER_ROLES) {
            alert("This is agency home");
        });

});