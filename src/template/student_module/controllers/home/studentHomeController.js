/**
 * Created by trananhgien on 3/15/2016.
 */
define(['app', 'directives/job-grid/job-grid.js'], function(app) {

    app.controller('studentHomeController', function($scope, $log) {
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

    });

});