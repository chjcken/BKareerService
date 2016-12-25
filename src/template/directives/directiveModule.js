/**
 * Created by trananhgien on 3/21/2016.
 */

define(['directives/file-grid/file-grid',
        'directives/job-grid/job-grid',
        'directives/modal/modal',
        'directives/scroll-top/scroll-top',
        'directives/search-bar/search-bar',
        'directives/search-box-dropdown/search-box-dropdown',
        'directives/tab/tabset',
        'directives/view-create-job/view-create-job',
        'directives/view-sticky/sticky',
        'directives/login-form/login-form',
        'directives/form-view-edit/form-view-edit',
        'directives/view-create-profile/view-create-profile',
        ],
    function(fileGird,
            jobGrid,
            modal,
            scrollTop,
            search,
            searchBoxDropdown,
            tabset,
            viewCreateJob,
            sticky,
            loginForm,
            formViewEdit,
            viewCreateProfile) {

        var directiveModule = angular.module('app.directives', []);

        directiveModule.directive('fileGrid', fileGird);
        directiveModule.directive('jobGrid', jobGrid);
        directiveModule.directive('modal', modal);
        directiveModule.directive('scrollTop', scrollTop);
        directiveModule.directive('searchBar', search.searchBar);
        directiveModule.directive('searchBox', search.searchBox);
        directiveModule.directive('searchBoxDropdown', searchBoxDropdown);
        directiveModule.directive('tabset', tabset.tabset);
        directiveModule.directive('tab', tabset.tab);        
        directiveModule.directive('viewCreateJob', viewCreateJob);
        directiveModule.directive('sticky', sticky);
        directiveModule.directive('loginForm', loginForm);
        directiveModule.directive('editForm', formViewEdit);
        directiveModule.directive('agencyProfile', viewCreateProfile);

        return directiveModule;
    }
);
