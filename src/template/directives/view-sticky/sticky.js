/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app'], function(app) {

    app.directive('sticky', function() {
        return {
            restrict: 'A',
            transclude: true,
            template: '<div class="sticky"><div ng-transclude></div></div>',
            link: function(scope, ele, atts) {
                var originTop = 0;

                function isScrollTo(element) {
                    var docViewTop = $(window).scrollTop();
                    var eleTop = ele.offset().top;
                    return eleTop <= docViewTop;
                }

                $(window).scroll(function() {
                    if ( isScrollTo(ele) ) {
                        ele.css('top', '0px');
                        ele.css('position', 'fixed');


                    }

                    var stopHeight = $('#header').outerHeight(true);
                    if ( stopHeight >= $(window).scrollTop() ) {
                        ele.css('position', 'absolute');
                        //ele.css('top', stopHeight);
                    }
                });
            }
        }
    })

})