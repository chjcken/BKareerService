/**
 * Created by trananhgien on 4/4/2016.
 */

define(['app'], function(app) {

    app.directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modal.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer">' +
                '<button class="btn btn-default" ng-hide="modal.hideCancel" ng-click="close(0)">Cancel</button>' +
                '<button class="btn btn-primary" ng-click="close(1)">OK</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: {
                modal: "="
            },
            link: function postLink(scope, element, attrs) {
                var btn = 0;
                scope.modal.hideCancel = scope.modal.hideCancel === undefined ? true : scope.modal.hideCancel;
                scope.modal.show = function() {
                    element.modal('show');
                }

                scope.modal.hide = function(whichBtn) {
                    scope.close(whichBtn);
                }

                scope.close = function(whichBtn) {
                    btn = whichBtn;
                    element.modal('hide');
                }

                element.bind('hidden.bs.modal', function() {
                    scope.$apply(function() {
                        switch (btn) {
                            case 0: if (scope.modal.oncancel) scope.modal.oncancel();
                                break;
                            case 1: if (scope.modal.onok) scope.modal.onok();
                                break;
                            default:
                                break;
                        }
                    });

                    btn = -1;
                });
            }
        };

    });
});