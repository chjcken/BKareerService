/**
 * Created by trananhgien on 7/9/2016.
 */

define([], function() {

    function searchBoxDropdown ($timeout) {
        var template =
            '<form ng-submit="submit({text: text, city: selectedCity.name, district: selectedDist.name})"'
            +'<div class="search-box">'
            +   '<div>'
            +      '<div class="group">'
            +           '<input ng-model="text" type="text" name="searchText" placeholder="{{placeholder}}">'
            +           '<input type="submit" class="btn-search" value="search" />'
            +   '</div>'
            +   '<div class="pane">'
            +       '<div class="pane-city">'
            +           '<label>City:</label>'
            +           '<select ng-model="selectedCity" ng-change="selectedDist=selectedCity.districts[0]"'
            +               'ng-options="opt.name for opt in cities">'
             +          '</select>'
            +       '</div>'
            +       '<div class="pane-district">'
            +           '<label>District:</label>'
            +           '<select ng-model="selectedDist"'
            +               'ng-options="dist.name for dist in selectedCity.districts">'
            +           '</select>'
            +       '</div>'
            +   '</div>'
            +'</div>'
            +'</form>'

        return {
            scope: {
                placeholder: "@",
                cities: "=",
                onSubmit: "&"
            },
            template: template,
            link: function(scope, ele, attrs) {
              
              scope.submit = function(params) {
             
                
                scope.onSubmit({arg: params});
              };
                scope.$watch('cities', function(cities) {
                  if (cities) {
                    console.log("search dropdown cities", cities);
                    scope.selectedCity = cities[0];
                    scope.selectedDist = scope.selectedCity.districts[0];
                  }
                });

                $(ele).find("input[name='searchText']").focus(function() {
                    $(ele).find(".pane").addClass("active");
                });

                $(window).click(function(e) {
                    if ($(e.target).attr("class") === "pane"
                        || $(e.target).attr("name") === "searchText"
                        || $(e.target).parents(".pane").size()) {

                    }
                    else {
                        $(ele).find(".pane").removeClass("active");
                    }
                });
            }
        };
    };

    searchBoxDropdown.$inject = ["$timeout"];
    return searchBoxDropdown;
});