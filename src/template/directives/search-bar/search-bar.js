/**
 * Created by trananhgien on 3/20/2016.
 */

define(['app'], function(app) {

    app.controller('gtSearchBarController', function($scope) {
        var tags = [];

        $scope.addTags = function(tag) {
            tags.push(tag);
        };

        $scope.removeTag = function(tag) {
            var index = tags.indexOf(tag);
            if (index !== -1) {
                tags.splice(index, 1);
            }
        }
    });

    app.directive('searchBar', function($window, $timeout, $filter) {
        return {
            restrict: 'E',
            scope: {
                tags: "=", // array of string like: ['PHP', 'iOS', 'Python']
                placeholder: "@", // prompt for input field,
                items: "=",
                inputText: "=text",
                hidePopupOnEscape: "@",
                onEnter: "&"
            },
            templateUrl: 'directives/search-bar/search-bar.html',
            link: function(scope, element, atts, controller) {
                scope.currentIndex = -1;
                scope.filtered = [];
                var inputEle = element.find('#inputText');
                var container = inputEle.parent().parent();

                // This section for adjustment input field

                inputEle.attr('placeholder', scope.placeholder);

                var getRemainSize = function() {
                    var left = 0, width = 0;
                    var length = container.children().length;
                    var e = container.children().eq(length - 2);
                    left = e.position().left;
                    width = e.outerWidth(true);

                    return container.innerWidth() - left - width - 40;
                }

                // if remain size is less than 200px then input field is set full width of parent contaner
                // else set remain size
                var reCalculateWidthInputEle = function() {
                    var remainSize = getRemainSize();
                    if (remainSize < 150) { // 200 is the reasonable width input field to fill text
                        inputEle.outerWidth(container.width() - 20);
                    } else {
                        inputEle.outerWidth(remainSize);
                    }
                }

                function hidePopover() {
                    scope.$apply(function(){
                        scope.hideOnKeyDown = true;
                    });
                }

                var windowResizeEvent = function () {
                    reCalculateWidthInputEle();
                };

                // when window is resized, we need to recalculate size of input field
                angular.element($window).bind('resize', function() {
                    windowResizeEvent();
                });

                // call recalculate width of input field at the first time, delay 1s to get dom ready
                $timeout(reCalculateWidthInputEle, 1000);

                // Section for logic

                scope.inputText = scope.inputText || '';

                scope.isRemainEmpty = function() {
                    return scope.tags.length === 0;
                };

                scope.isChoosedItem = function(item) {
                    return scope.tags.indexOf(item) != -1;
                }
                
               
                scope.addItem = function(item) {
                    item = item.trim().replace(/\s\s+/g, ' ');
                    if (scope.tags.indexOf(item) > -1) return;
                    scope.tags.push(item);
                    scope.inputText = '';
                    scope.inputChange();
                    inputEle.outerWidth(inputEle.outerWidth(true) - 50);

                   /* $timeout(function(){
                        scope.tags.push(item);
                    }, 20);
*/
                    $timeout(reCalculateWidthInputEle, 20);
                }

                scope.removeItem = function(item) {

                    var indexSelected = scope.tags.indexOf(item);
                    scope.tags.splice(indexSelected, 1);
                    $timeout(reCalculateWidthInputEle, 20);
                }

                scope.deleteTag = function(keyCode) {
                    if (keyCode === 8 && !scope.inputText) {
                        scope.tags.pop();
                        $timeout(reCalculateWidthInputEle, 20);
                    } else if (keyCode === 27) {//escape pressed
                        scope.hideOnKeyDown = true;
                    } else if (keyCode === 13) {

                        if (scope.currentIndex > -1) {
                            var item = $(element).find('.popup-items').children('.active:visible').eq(0).text();
                            scope.addItem(item);
                            return;
                        }
                            
                        scope.addItem(scope.inputText);
                    }
                }
                
                scope.inputChange = function() {
                    if (scope.inputText.length === 0) {
                        scope.currentIndex = -1;
                    }
                    scope.filtered = $filter('filter')(scope.items, scope.inputText);
                    $(element).find('.popup-items').children()
                                            .removeClass('active');
                };
                
                scope.$on('globalKeyDown', function(e, keyCode) {
                    
                    switch(keyCode) {
                        case 27:
                            if (scope.hidePopupOnEscape && keyCode === 27) hidePopover();
                            break;
                        case 40: 
                            if (scope.currentIndex < scope.filtered.length - 1) {
                                scope.currentIndex++;
                                activeRow(scope.currentIndex, scope.currentIndex - 1);
                            }
                            break;
                        case 38:
                            if (scope.currentIndex > 0) {
                                scope.currentIndex--;
                                activeRow(scope.currentIndex, scope.currentIndex + 1);
                            }
                            break;
                    }
                    
                    
                });

                scope.$on('globalMouseDown', function(e, mEvent, self) {
                    if (!$(mEvent.target).parents().is('.popup-items')
                            && !$(mEvent.target).is('#inputText')) {
                        hidePopover();
                    }
                });

                function activeRow(index, clearIndex) {
                    if (clearIndex > -1) {
                        $(element).find('.popup-items').children(':visible')
                                            .eq(clearIndex)
                                            .removeClass('active');
                    }
                    
                    $(element).find('.popup-items').children(':visible')
                        .eq(index)
                        .addClass('active');
                }
                
            }
        };
    });

    app.directive('searchBox', function($window) {
        return {
            restrict: "E",
            scope: {
                searchBarData: "=", // object {tags: [], placeholder: 'String', items: [], text: 'String'}
                cities: '=',
                onSearchBtnClick: '&',
                popularTags: '='
            },
            templateUrl: 'directives/search-bar/search-box.html',
            link: function(scope, element, attrs) {
                scope.searchBarData.tags = scope.searchBarData.tags || [];
                scope.searchBarData.placeholder = scope.searchBarData.placeholder || '';
                scope.searchBarData.text = scope.searchBarData.text || '';
                scope.searchBarData.items = scope.searchBarData.items || [];
                
                scope.selectedCity = {};
                scope.selectedDist = {};

                scope.search = function() {

                    scope.onSearchBtnClick({
                        params: {
                            tags: scope.searchBarData.tags,
                            text: scope.searchBarData.text,
                            city: scope.selectedCity.name === 'All' ? '' : scope.selectedCity.name,
                            district: scope.selectedDist.name === 'All' ? '' : scope.selectedDist.name
                        }
                    });
                };
                
                scope.$watch('cities', function(value) {
                    if (value && value.length > 0) {
                        scope.selectedCity = value[0];
                        scope.selectedDist = scope.selectedCity.districts[0];
                    }
                });


            }
        };
    });
});