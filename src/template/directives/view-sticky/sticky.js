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
          var originTop, width, position;
          $(document).ready(function () {
            $timeout(function () {
              originTop = $(ele).offset().top;
              width = ele.outerWidth();
              position = ele.css('position');

              console.log(originTop, ele);
            }, 1000);
          });

          function isScrollTo(element) {
            var docViewTop = $(window).scrollTop();
//                    var eleTop = ele.offset().top;
            return originTop <= docViewTop;
          }
          
          $(window).resize(function() {
            ele.css('width', width);
            ele.css('position', position);
            
            originTop = $(ele).offset().top;
            width = ele.outerWidth();
            position = ele.css('position');
          });
          
          $(window).scroll(function () {
            if (screenResolution('xs') || screenResolution('sm')) {
              return;
            }
            
            if (isScrollTo(ele)) {
              ele.css('top', '0px');
              ele.css('position', 'fixed');
              ele.css('width', width + 'px');

            } else {
              ele.css('position', position);
            }
          });
          

        }
      }
    }])

})