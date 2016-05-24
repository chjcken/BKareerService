/**
 * Created by trananhgien on 4/9/2016.
 */

define(['angularAMD', 'angular', 'angular-summernote', 'datePicker', 'ngProgress', 'ngTable','ngAnimate', 'ui.bootstrap'], function() {
    console.log("Angular", angular);
    var UIModule = angular.module('uiModule', ['summernote', '720kb.datepicker', 'ngProgress', 'ngTable','ngAnimate', 'ui.bootstrap']);

    UIModule.directive("deviceScreen", function() {
        return {
            restrict: 'E',
            template: '<div class="device-xs visible-xs"></div>'
            + '<div class="device-sm visible-sm"></div>'
            + '<div class="device-md visible-md"></div>'
            + '<div class="device-lg visible-lg"></div>',
            link: function(scope, ele) {

            }
        }
    });

    UIModule.factory('screenResolution', function() {

        function isBreakpoint( alias ) {
            return $('.device-' + alias).is(':visible');
        }

        return isBreakpoint;

    });
    
    return UIModule;
});