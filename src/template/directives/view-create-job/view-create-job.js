/**
 * Created by trananhgien on 5/18/2016.
 */

define(['app', 'datePicker'], function(app) {

    app.directive("viewCreateJob",['$filter', 'utils', function($filter, utils) {
        var controller = ['$scope', 'utils', function($scope, utils) {

            $scope.options = {
                height: 400,
                toolbar: [
                    ['style', ['style','bold', 'italic', 'clear']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']]
                ]
            };

        }];


        return {
            restrict: 'E',
            controller: controller,
            templateUrl: 'directives/view-create-job/view-create-job.html',
            link: function(scope, ele, atts) {
                var validDate;
                scope.listCities = utils.getListLocations();

                scope.city = scope.listCities[0];
                scope.district = scope.city.districts[0];

                scope.expire = $filter('date')(new Date(), 'yyyy/MM/dd');
                scope.tags = [];
                scope.items = ['AAAA', 'BBBB', 'CCCC'];

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