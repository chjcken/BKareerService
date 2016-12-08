/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app'], function(app) {

    app.directive('sticky', ['$timeout', function($timeout) {
        return {
            restrict: 'A',
            transclude: true,
            template: '<div class="sticky"><div ng-transclude></div></div>',
            link: function(scope, ele, atts) {
              var originTop, width, position;
              $(document).ready(function() {
                originTop = $(ele).offset().top;
                width = ele.outerWidth();
                position = ele.css('position');
                
                console.log(originTop, ele);
              });
                
                function isScrollTo(element) {
                    var docViewTop = $(window).scrollTop();
//                    var eleTop = ele.offset().top;
                    return originTop <= docViewTop;
                }

                $(window).scroll(function() {
                    if ( isScrollTo(ele) ) {
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