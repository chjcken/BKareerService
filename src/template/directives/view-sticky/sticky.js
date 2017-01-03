/**
 * Created by trananhgien on 4/10/2016.
 */

define([], function () {

  function sticky($timeout, screenResolution, $window) {
      return {
        restrict: 'A',
        transclude: true,
        template: '<div class="sticky"><div ng-transclude></div></div>',
        link: function (scope, ele, atts) {
          var originTop, width, position, top;
          var topEle = atts.top;
          var topH = 0;
          
          $(document).ready(function () {
            $timeout(function () {
              originTop = $(ele).offset().top;
              width = ele.outerWidth();
              position = ele.css('position');
              top = ele.css('top');
              topH = top ? $(topEle).outerHeight(false) : topH;
            }, 1000);
          });

          function isScrollTo(element) {
            var docViewTop = $(window).scrollTop();

            return originTop <= docViewTop + topH;
          }

          $(window).resize(function() {
            ele.css('width', 'auto');
            $timeout(function() {
              ele.css('position', position);
              ele.css('top', top);

              originTop = $(ele).offset().top;
              width = ele.outerWidth();
              position = ele.css('position');
              
              if (topH)
                ele.css('width', width);
              else
                ele.css('width', '100%');
            }, 0);

          });

          $(window).scroll(function () {
            if (screenResolution('xs')) {
              return;
            }

            if (isScrollTo(ele)) {
              ele.css('top', topH + 'px');
              ele.css('position', 'fixed');
              ele.css('width', topH > 0 ? width + 'px' : '100%');

            } else {
              ele.css('top', top);
              ele.css('position', position);
            }
          });


        }
      }
    }

    sticky.$inject = ['$timeout', 'screenResolution', '$window'];
    return sticky;
})
