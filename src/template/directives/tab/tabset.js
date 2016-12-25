/**
 * Created by trananhgien on 5/23/2016.
 */


define([], function() {

    function tab() {
        return  {
            restrict: "E",
            transclude: true,
            replace: true,
            template: "<div role='tabpanel' class='tab-pane fade' ng-class='{in: active, active: active}' ng-transclude></div>",
            scope: {
                heading: "@"
            },
            require: '^tabset',
            link: function(scope, ele, atts, tabsetCtrl) {
                scope.active = scope.active || false;
                tabsetCtrl.addTab(scope);
            }
        };
    }

    function tabset() {
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
            controller: function() {
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
                    angular.forEach(self.tabs, function(tab, index) {
                        if (tab.active && tab !== selectedTab) {
                            tab.active = false;
                        }
                        if (tab === selectedTab) {
                          if (self.onChange) self.onChange(index);
                        }
                    });

                    selectedTab.active = true;
                }

                self.selectTabIndex = function(index) {
                  self.select(self.tabs[index]);

                };


            },
            link: function(scope, ele, attrs, ctrl) {
                if (scope.navType === 'nav-pills') {
                    ctrl.classes['nav-pills'] = true;
                } else if (scope.navType === 'nav-justified') {
                    ctrl.classes['nav-justified'] = true;
                }

                ctrl.onChange = function(index) {
                  scope.currentTab = index;
                };

                console.log("vvvvv-->", scope.activeTabIndex, scope.nav);
                scope.$watch('currentTab', function(newVal) {
                  newVal = newVal || 0;
                  ctrl.selectTabIndex(newVal);
                });
            }
        };
    }

    return {tab: tab, tabset: tabset};
});
