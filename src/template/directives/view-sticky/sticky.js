/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app'], function (app) {

  app.directive('sticky', ['$timeout', 'screenResolution', '$window', function ($timeout, screenResolution, $window) {
      return {
        restrict: 'A',
        transclude: true,
        template: '<div class="sticky"><div ng-transclude></div></div>',
        link: function (scope, ele, atts) {
          var originTop, width, position, top;
          $(document).ready(function () {
            $timeout(function () {
              originTop = $(ele).offset().top;
              width = ele.outerWidth();
              position = ele.css('position');
              top = ele.css('top');
            }, 1000);
          });

          function isScrollTo(element) {
            var docViewTop = $(window).scrollTop();

            return originTop <= docViewTop;
          }
          
          $(window).resize(function() {
            ele.css('width', 'auto');
            $timeout(function() {
              ele.css('position', position);
              ele.css('top', top);

              originTop = $(ele).offset().top;
              width = ele.outerWidth();
              position = ele.css('position');
              
              ele.css('width', width);
            }, 1000);
            
          });
          
          $(window).scroll(function () {
            if (screenResolution('xs')) {
              return;
            }
            
            if (isScrollTo(ele)) {
              ele.css('top', '0px');
              ele.css('position', 'fixed');
              ele.css('width', width + 'px');

            } else {
              ele.css('top', top);
              ele.css('position', position);
            }
          });
          

        }
      }
    }])

})