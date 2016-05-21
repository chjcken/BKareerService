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
                onSubmit: "&"
            },
            restrict: 'E',
            controller: controller,
            templateUrl: 'directives/view-create-job/view-create-job.html',
            link: function(scope, ele, atts) {
                var validDate;
                
                scope.city = scope.locations.length ? scope.locations[0] : [];
                scope.district = scope.city.length ? scope.city.districts[0] : [];
                
                console.log("view create job", scope.locations);
                
                scope.expire = $filter('date')(new Date(), 'yyyy/MM/dd');
                scope.tags = [];
                scope.currentDate = new Date().toDateString();
                
                scope.submit = function() {
                    var data = {
                        title: scope.title,
                        salary: scope.salary,
                        address: scope.address,
                        cityid: scope.city.id,
                        districtid: scope.district.id,
                        expiredate: new Date(scope.expire).getTime(),
                        desc: scope.desc,
                        requirement: scope.requirement,
                        benifits: scope.benifits,
                        tags: scope.tags,
                        isinternship: false
                    };
                    console.log("data create job", data);
                    scope.onSubmit({data: data});
                };
                
                scope.$watch('locations', function(value) {
                    console.log('watch', value);
                    if (value.length === 0) return;
                    scope.city = value[0];
                    scope.district = scope.city.districts[0];
                });
                
                scope.$watch('expire', function(value) {
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