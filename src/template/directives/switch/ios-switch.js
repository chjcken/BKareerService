/**
 * Created by trananhgien on 5/25/2016.
 */

define(['app'], function(app) {

    app.directive('iosSwitch', function() {
        var num = 0;
        var link = function(scope, ele, attrs) {
            /*scope.$watch('value', function(newVal) {
                scope.onChange({value: newVal});
            });*/
            num++;
            scope.id = 'gt' + num;
            scope.label = attrs.label;
        };

        return {
            scope: {
                onChange: "&",
                value: "="
            },
            template: '<input ng-model="value" ng-change="onChange({value: value})" type="checkbox" class="ios-switch" id="{{id}}"> ' +
            '<label for="{{id}}"> <span class="sw" ng-class="{active: value}"></span>' +
            '{{label}}</label>',
            restrict: 'E',
            link: link
        };
    });
});