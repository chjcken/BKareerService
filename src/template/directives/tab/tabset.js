/**
 * Created by trananhgien on 5/23/2016.
 */


define(['app'], function(app) {

    app.directive('tab', function() {
        return  {
            restrict: "E",
            transclude: true,
            template: "<div role='tabpanel' class='tab-pane fade' ng-class='{in: active, active: active}' ng-transclude></div>",
            scope: {
                heading: "@"
            },
            require: '^tabset',
            link: function(scope, ele, atts, tabsetCtrl) {
                scope.active = false;
                tabsetCtrl.addTab(scope);
            }
        };
    });

    app.directive('tabset', function() {
        return {
            restrict: "E",
            transclude: true,
            template: "<div role='tabpanel'>" +
            "<ul class='nav nav-tabs' ng-class='tabset.classes' role='tablist'>" +
            "<li role='presentation' ng-repeat='tab in tabset.tabs' ng-class='{active: tab.active}'>" +
            "<a style='cursor: pointer' data-toggle='tab' role='tab' ng-click='tabset.select(tab)'>{{tab.heading}}</a> " +
            "</li> " +
            "</ul> {{tabset.type}}" +
            "<div class='tab-content' ng-transclude></div>" +
            "</div>",
            bindToController: true,
            controllerAs: 'tabset',
            controller: function($scope) {
                var self = this;
                self.tabs = [];
                self.classes = {'nav-pills': false, 'nav-justified': false};
                self.addTab = function(tab) {
                    self.tabs.push(tab);
                    if (self.tabs.length === 1) {
                        tab.active = true;
                    }

                }

                self.select = function(selectedTab) {
                    angular.forEach(self.tabs, function(tab) {
                        if (tab.active && tab !== selectedTab) {
                            tab.active = false;
                        }
                    });

                    selectedTab.active = true;
                }
            },
            link: function(scope, ele, attrs, ctrl) {
                if (scope.navType === 'nav-pills') {
                    ctrl.classes['nav-pills'] = true;
                } else if (scope.navType === 'nav-justified') {
                    ctrl.classes['nav-justified'] = true;
                }
            },
            scope: {
                navType: "@"
            }
        };
    });

});