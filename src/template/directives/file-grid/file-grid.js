/**
 * Created by trananhgien on 5/23/2016.
 */

define(['app'], function(app) {

    app.directive('fileGrid', function($timeout) {
        var template = '<div class="row">' +
            '<div class="col-xs-6 col-sm-4 col-md-3" ng-repeat="file in files"> ' +
                '<div class="file-item" > ' +
                    
                    '<div class="item-body" ng-click="click(file, $index)" ng-dblclick="dblClick(file, $index)"> ' +
                      '<div class="file-context">' + 
                        '<div class="group-button">' +
                          '<button class="btn btn-sm btn-info" ng-click="onDownload({file: file})"><i class="fa fa-download" aria-hidden="true"></i></button>' + 
                          '<button class="btn btn-sm btn-danger" ng-click="onDelete({file: file})"><i class="fa fa-trash-o" aria-hidden="true"></i></button>' + 
                        '</div>' + 
                      '</div>' +
                        '<img ng-src="assets/images/{{file.type === \'docx\' ? \'doc\' : file.type}}.png" alt="file icon"/> ' +
                    '</div>' +
                    '<div class="item-footer"> ' +
                        '<span class="file-name"> {{file.name}} </span> ' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '</div>';

        var link = function(scope, ele) {
            var currentIndex;
            var clicked, cancelClick;

            scope.dblClick = function(file, index) {
                currentIndex = index;
                scope.onDblClick({file: file});
                hiligth(index);
            };

            scope.click = function(file, index) {
                currentIndex = index;
                scope.onClick({file: file});
                hiligth(index);

            }

            scope.$on('globalMouseDown', function() {
                unHilight(currentIndex);
            });

            function hiligth(index) {

                $(ele).find('.file-item').removeClass('active');
                $(ele).find('.file-item').eq(index).addClass('active');
            }

            function unHilight(index) {
                $(ele).find('.file-item').eq(index).removeClass('active');
            }
        };

        return {
            scope: {
                files: "=",
                onDblClick: "&",
                onClick: "&",
                onDownload: "&",
                onDelete: "&"
            },
            template: template,
            restrict: 'E',
            link: link
        };
    });

});