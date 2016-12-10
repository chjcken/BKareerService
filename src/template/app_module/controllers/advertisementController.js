/**
 * Created by trananhgien on 3/27/2016.
 */

define([
  'app',
  'directives/view-sticky/sticky'
], function(app) {
    app.controller('advertisementController', function($scope) {

        $scope.jobs = [
            {
                id: '001',
                title: '15 Java Developers'
            },
            {
                id: '001',
                title: '15 Java Developers'
            },
            {
                id: '001',
                title: '15 Java Developers'
            }
        ];

        $scope.agency = {
            id: '001',
            name: 'FPT Software',
            brief_desc: 'The leading provider of software outsourcing services in Vietnam',
            url_logo: 'https://itviec.com/system/production/employers/logos/100/fpt-software-logo-170-151.png?1454112598'
        }

    });
});