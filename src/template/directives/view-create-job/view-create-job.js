/**
 * Created by trananhgien on 5/18/2016.
 */

define(['app', 'datePicker'], function(app) {
    /*
     * "- title: string
- salary: string
- address: string
- cityid: long
- districtid: long
- expiredate: long
- desc: string
- requirement: string
- benifits: string
- isinternship: bool
"
     */
    app.directive("viewCreateJob",['$filter', 'utils', '$parse', function($filter, utils, $parse) {
        var controller = ['$scope', function($scope) {

            $scope.options = {
                height: 200,
                toolbar: [
                    ['style', ['style','bold', 'italic', 'clear']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']]
                ]
            };

        }];


        return {
            scope: {
                items: "=",
                locations: "=",
                onSubmit: "&",
                jobModel: "="
            },
            restrict: 'E',
            controller: controller,
            templateUrl: 'directives/view-create-job/view-create-job.html',
            link: function(scope, ele, atts) {
                var validDate;
                var jobModel = scope.jobModel;
//                jobModel.city = scope.locations.length ? scope.locations[0] : [];
//                jobModel.district = jobModel.city.length ? jobModel.city.districts[0] : [];
                
                console.log("view create job", scope.locations);
                
                jobModel.expire = jobModel.expire || $filter('date')(new Date(), 'yyyy/MM/dd');
                jobModel.tags = jobModel.tags || [];
                jobModel.currentDate = new Date().toDateString();
                
                scope.$watch('locations', function(value) {
                    console.log('watch', value);
                    if (value.length === 0 || jobModel.city) return;
                    jobModel.city = value[0];
                    jobModel.district = jobModel.city.districts[0];
                });
                
                scope.$watch('jobModel.expire', function(value) {
                    validDate = new Date(value);

                    if (validDate.toString() == 'Invalid Date') {
                        scope.error = 'This is not a valid date';
                    } else {
                        scope.error = false;
                    }
                });


            }
        }
    }]);

});