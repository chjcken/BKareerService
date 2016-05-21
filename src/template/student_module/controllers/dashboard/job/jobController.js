/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app'], function(app) {

    app.controller('studentJobController',['$scope', 'utils', 'jobService', 
        function($scope, utils, jobService) {
        //alert('manage job');
        $scope.setCurrentTabIndex(0);
        
        var req = utils.MultiRequests;
        req.init();
        req.addRequest(jobService.getApplied());
        req.doAllRequest().then(function(result) {
            if (result.error) alert(result.error);
            else {
                console.log("resut applied job", result);
                $scope.jobs = result[0];
            }
        });
        
        $scope.jobs = [
            {
                id: 'job123',
                title: 'Test Job Title',
                location: 'Ho Chi Minh, Dist. 1',
                salary: 'Competitive Salary',
                description: 'CommBank is a top 10 global bank and the most recognized financial ' +
                'services brand in Australia. As a leading player in the industry, we never lose sight...',
                tags: ['PHP', 'English', 'Java'],
                num_registered: 10,
                status: "Pending",
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
                num_registered: 12,
                status: "Pending",
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
                num_registered: 2,
                status: "Pending",
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
                num_registered: 3,
                status: "Accepted",
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
                num_registered: 10,
                status: "Accepted",
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
                num_registered: 10,
                agency: {
                    name: 'Commonwealth Bank of Australia',
                    url_logo: 'https://itviec.com/system/production/employers/logos/1372/commonwealth-bank-of-australia-logo-65-65.jpg?1454112692',
                    id: 'agency123'
                }
            }
        ];
    }]);

});