/**
 * Created by trananhgien on 3/27/2016.
 */

define(['app'], function(app) {
    app.controller('advertisementController', function($scope) {

        // TODO: get data for advertisement
       /* $http.get('api/', {
            params: {
                q: 'spotlight'
            }
        }).then(function(res) {
            $scope.jobs = res.data.jobs;
            $scope.agency = res.data.agency;
        });*/
        console.log('run advertisement  controller');
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