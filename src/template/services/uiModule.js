/**
 * Created by trananhgien on 4/9/2016.
 */

define(['angularAMD',
  'angular',
  'angular-summernote',
  'datePicker',
  'ngProgress',
  'ngTable',
  'ngAnimate',
  'ui.bootstrap',
  'angular-busy',
  'ng-multiselect',
  'toaster',
  'ng-tree',
  'angularjs-social-login',
  'angular-ladda',
  'ng-tags-input',
  'fake-loader',
  'ng-highcharts'
], function () {

  var UIModule = angular.module('uiModule',
          [
            'summernote',
            '720kb.datepicker',
            'ngProgress',
            'ngTable',
            'ngAnimate',
            'ui.bootstrap',
            'cgBusy',
            'angularjs-dropdown-multiselect',
            'toaster',
            'ngJsTree',
            'socialLogin',
            'angular-ladda',
            'ngTagsInput',
            'highcharts-ng'
          ]);

  UIModule.directive("deviceScreen", function () {
    return {
      restrict: 'E',
      template: '<div class="device-xs visible-xs"></div>'
              + '<div class="device-sm visible-sm"></div>'
              + '<div class="device-md visible-md"></div>'
              + '<div class="device-lg visible-lg"></div>',
      link: function (scope, ele) {

      }
    }
  });

  UIModule.factory('screenResolution', function () {

    function isBreakpoint(alias) {
      return $('.device-' + alias).is(':visible');
    }

    return isBreakpoint;

  });

  UIModule.directive('fileModel', function ($parse) {
    return {
      scope: {
        fileModel: "=",
        onChange: "&",
        limit: "@"
      },
      restrict: "A",
      link: function (scope, ele, atts) {
        var limit = parseInt(scope.limit) || 1;
        if (limit > 1) {
          $(ele).attr("multiple", "true");
        }
        
        ele.bind('change', function () {
          scope.$apply(function () {
            
            var filelist = ele[0].files;
            
            var files = [];
            for (var i = 0; i < filelist.length; i++) {
              files.push(filelist[i]);
            }
            
            console.log("limit", limit, files[0].name);
            if (limit > 1) {
              scope.fileModel = files.splice(0, Math.min(limit, files.length));
            } else {
              scope.fileModel = files[0];
            }
            
            scope.onChange({file: scope.fileModel});
            $(ele).val('');

          });
        });
      }
    };
  })
  .directive("backgroundUrl", function() {
    return {
      restrict: "A",
      scope: {
        backgroundUrl: "="
      },
      link: function(scope, ele) {
        
        scope.$watch('backgroundUrl', function(value) {
          if (value) {
            $(ele).css('background-image', 'url("' + value + '")');
          }
        });

      }
    };
  })
  .directive("fakeLoader", function() {
    return {
      restrict: "E",
      scope: {
        promise: "=",
        options: "="
      },
      link: function(scope, ele) {
        if (!$('#fakeLoader').length) {
          $('body').append('<div id="fakeloader"></div>');          
        }
        
        var defaultOpt = {
          zIndex:"9999999",//Default zIndex
          spinner:"spinner2",//Options: 'spinner1', 'spinner2', 'spinner3', 'spinner4', 'spinner5', 'spinner6', 'spinner7'
          bgColor:"rgba(0, 0, 0, 0.9)", //Hex, RGB or RGBA colors
          opacity: 0.5
        };
        var options = scope.options;
        
        for (var key in options) {
          if (options.hasOwnProperty(key)) {
            defaultOpt[key] = options[key];
          }
        }
        
        scope.$watch('promise', function(value) {
          if (value) {
            $("#fakeloader").fakeLoader(defaultOpt);
            value.then(function() {
              $("#fakeloader").fakeLoader("close");
            });

          }
        });
    
                
      }
    };
  })
.directive("gtClass", function() {
  return {
    link: function(scope, ele, attr) {
      var classes = attr.gtClass;
      $(ele).addClass(classes);
    }
  };
})
.directive('notiItem', function() {
  return {
    template: '<a ng-href="{{directiveData.url}}">{{directiveData.title}}</a>'
  };
});

    
                  

  return UIModule;
});