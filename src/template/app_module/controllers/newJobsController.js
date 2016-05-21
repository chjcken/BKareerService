/**
 * Created by trananhgien on 3/26/2016.
 */

define(['app', 'AuthService'], function(app) {

    app.controller('newJobsController', function($scope, $stateParams, $state, jobService) {

        console.log($stateParams.type);
        
        if ($stateParams.type == 'job') {
            jobService.getAll(2)
                .then(function(listJobs) {
                    console.log("listJobs", listJobs);
                    $scope.jobs = listJobs;
                });
        } else if ($stateParams.type == 'internship') {
            jobService.getAll(1)
                    .then(function(listJobs) {
                        $scope.jobs = listJobs;
                    })
        }
        


        $scope.tags = ['adfasdfPHP', 'AngularJs'];
        $scope.placeholder = "Skill, Jobs title, Company";
        $scope.items = ['adfasdfPHP', 'Javasdfa', 'AngularJs', 'Englasdfasdfish',
            'MySQL', 'iOS', 'C/C++', 'C#', 'Front-End', 'NodeJs',
            'MongoDB', 'MEAN Stack', 'Reacasdfasdft', 'Wordpress', 'Joomla', 'Senior Full Stack AngularJs Mongodb'
        ];


        $scope.searchBarData = {
            tags: ['adfasdfPHP', 'AngularJs'],
            placeholder: "Skill, Jobs title, Company",
            items: ['adfasdfPHP', 'Javasdfa', 'AngularJs', 'Englasdfasdfish',
                'MySQL', 'iOS', 'C/C++', 'C#', 'Front-End', 'NodeJs',
                'MongoDB', 'MEAN Stack', 'Reacasdfasdft', 'Wordpress', 'Joomla', 'Senior Full Stack AngularJs Mongodb'
            ],
            text: ''
        };

        $scope.cities = [
            {
                name: 'All',
                districts: ['All'],
            },
            {
                name: 'TP. Ho Chi Minh',
                districts: ['All', 'Dist.1', 'Dist.2', 'Tan Binh']
            },
            {
                name: 'Ha Noi',
                districts: ['All', 'Hoan Kiem', 'Tay Ho', 'Gia Lam']
            }
        ];


        /**
         * Get search result from server and update model "jobs"
         * @param params Object {tags: [], text: '', location: {city: '', district: ''}}
         */
        $scope.doSearch = function(params) {
            /*var data = searchService.search(params);
             data.then(function(searchResult){
             $scope.jobs = searchResult;
             });*/
            console.log("params", params);
            if (params.city == 'All') delete params.city;
            if (params.district == 'All') delete params.district;

            $state.go('app.home.search', params);
        };

    });

});