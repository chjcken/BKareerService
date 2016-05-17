/**
 * Created by trananhgien on 3/26/2016.
 */

define(['app', 'AuthService'], function(app) {

    app.controller('newJobsController', function($scope, $stateParams, $state, jobService) {

        console.log($stateParams.type);
        
        if ($stateParams.type == 'job') {
            jobService.getAll()
                .then(function(listJobs) {
                    console.log("listJobs", listJobs);
                    $scope.jobs = listJobs;
                });
        } else {
            $scope.jobs = [
                {
                    id: 'job123',
                    title: 'internship title',
                    location: 'Ho Chi Minh, Dist. 1',
                    salary: 'Competitive Salary',
                    description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                    'services brand in Australia. As a leading player in the industry, we never lose sight...',
                    tags: ['PHP', 'English', 'Java'],
                    num_registered: 10,
                    agency: {
                        name: 'Commonwealth Bank of Australia',
                        url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                        id: 'agency123'
                    }
                },
                {
                    id: 'job123',
                    title: 'internship title',
                    location: 'Ho Chi Minh, Dist. 1',
                    salary: 'Competitive Salary',
                    description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                    'services brand in Australia. As a leading player in the industry, we never lose sight...',
                    tags: ['PHP', 'English', 'Java'],
                    num_registered: 8,
                    agency: {
                        name: 'Commonwealth Bank of Australia',
                        url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                        id: 'agency123'
                    }
                },
                {
                    id: 'job123',
                    title: 'internship title',
                    location: 'Ho Chi Minh, Dist. 1',
                    salary: 'Competitive Salary',
                    description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                    'services brand in Australia. As a leading player in the industry, we never lose sight...',
                    tags: ['PHP', 'English', 'Java'],
                    num_registered: 12,
                    agency: {
                        name: 'Commonwealth Bank of Australia',
                        url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                        id: 'agency123'
                    }
                }
            ];
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