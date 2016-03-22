/**
 * Created by trananhgien on 3/15/2016.
 */
define(['app', 'directives/job-grid/job-grid.js', 'directives/search-bar/search-bar.js'], function(app) {

    app.controller('studentHomeController', function($scope, $log, searchService) {
        $log.info('STD HOME CTRL');

        $scope.jobs = [
            {
                id: 'job123',
                title: 'Test Job Title',
                location: 'Ho Chi Minh, Dist. 1',
                salary: 'Competitive Salary',
                description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                'services brand in Australia. As a leading player in the industry, we never lose sight...',
                tags: ['PHP', 'English', 'Java'],

                agency: {
                    name: 'Commonwealth Bank of Australia',
                    urlLogo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                    id: 'agency123'
                }
            },
            {
                id: 'job123',
                title: 'Test Job Title',
                location: 'Ho Chi Minh, Dist. 1',
                salary: 'Competitive Salary',
                description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                'services brand in Australia. As a leading player in the industry, we never lose sight...',
                tags: ['PHP', 'English', 'Java'],

                agency: {
                    name: 'Commonwealth Bank of Australia',
                    urlLogo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                    id: 'agency123'
                }
            },
            {
                id: 'job123',
                title: 'Test Job Title',
                location: 'Ho Chi Minh, Dist. 1',
                salary: 'Competitive Salary',
                description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                'services brand in Australia. As a leading player in the industry, we never lose sight...',
                tags: ['PHP', 'English', 'Java'],

                agency: {
                    name: 'Commonwealth Bank of Australia',
                    urlLogo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                    id: 'agency123'
                }
            }
        ];

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
                name: 'TP. Ho Chi Minh',
                districts: ['Dist.1', 'Dist.2', 'Tan Binh']
            },
            {
                name: 'Ha Noi',
                districts: ['Hoan Kiem', 'Tay Ho', 'Gia Lam']
            }
        ];


        /**
         * Get search result from server and update model "jobs"
         * @param params Object {tags: [], text: '', location: {city: '', district: ''}}
         */
        $scope.doSearch = function(params) {
            var data = searchService.search(params);
            data.then(function(searchResult){
                $scope.jobs = searchResult;
            });
        };
    });

});