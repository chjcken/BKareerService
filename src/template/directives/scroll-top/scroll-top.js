/**
 * Created by trananhgien on 4/3/2016.
 */


define([], function() {

    function scrollTop() {

        return {
            restrict: "EA",
            replace: false,
            template: '<div ng-click="scrollTop()" class="scrollTop"><img src="assets/images/caret-up.png"></div>',
            link: function(scope, ele, atts) {
                var scrollBtn = ele.find('.scrollTop');
                var isBroadcast = false;
                $(window).scroll(function() {
                    if ($(this).scrollTop() > 200) {
                        scrollBtn.stop().fadeIn('slow');
                    } else {
                        scrollBtn.stop().fadeOut('slow');
                    }
                });

                scope.scrollTop = function() {
                    $("body").animate({
                        scrollTop: 0
                    }, 300);
                };
            }
        }

    }

    return scrollTop;
});
