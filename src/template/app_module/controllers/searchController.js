/**
 * Created by trananhgien on 3/26/2016.
 */

define(['app'], function(app) {
    app.controller('searchController', function($scope, $stateParams) {
        // TODO: get params here

        // TODO: get data from server

        // TODO: set data to $scope.jobs

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
                    url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
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
                    url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
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
                    url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                    id: 'agency123'
                }
            }
        ];

        console.log('searchCTRL', $scope.tags);
        $scope.searchBarData = {
            tags: $stateParams.tags,
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
                districts: ['Dist.1', 'Dist.2', 'Tan Binh']
            },
            {
                name: 'Ha Noi',
                districts: ['Hoan Kiem', 'Tay Ho', 'Gia Lam']
            }
        ];

        $scope.doSearch = function(params) {
            //get data from server
        };
    });
});
