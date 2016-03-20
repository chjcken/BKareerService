/**
 * Created by trananhgien on 3/20/2016.
 */

define(['app'], function(app) {

    app.directive('searchBar', function() {
        return {
            scope: {
                popularKeywords: "=",

            }
        };
    });

});