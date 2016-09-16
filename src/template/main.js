/**
 * Created by trananhgien on 3/13/2016.
 */

require.config({
	baseUrl: '.',
    paths: {
        'lodash': 'libs/lodash.min',
        'ng-multiselect': 'libs/angularjs-dropdown-multiselect.min',
        'angular-animate': 'libs/angular-animate.min',
        'toaster': 'libs/toaster.min',
        'jstree': 'libs/jstree.min',
        'ng-tree': 'libs/ngJsTree.min',
        'angular-busy': 'libs/angular-busy',
        'ngAnimate': 'libs/angular-animate',
        'ui.bootstrap': 'libs/ui-bootstrap-custom-tpls-1.3.3',
        'ngTable': 'libs/ng-table.min',
        'ngProgress': 'libs/ngprogress',
        'summernote': 'libs/summernote/dist/summernote.min',
        'angular-summernote': 'libs/angular-summernote/dist/angular-summernote.min',
        'datePicker': 'libs/angular-datepicker',
        'smoothscroll': 'assets/js/smoothscroll',
        'jquery': 'assets/js/jquery',
        'bootstrap': 'assets/js/bootstrap.min',
        'ngGallery': 'libs/ngGallery',
        'ngStorage': 'libs/ngStorage',
        'sha1': 'libs/sha1',
        'angular_ngMock': 'libs/angular-mocks',
        'angular': 'libs/angular',
        'angularAMD': 'libs/angularAMD',
        'ui-router': 'libs/angular-ui-router',
        'servicesModule': 'providers/servicesModule',
        'studentModule': 'student_module/studentModule',
        'AuthService': 'services/AuthService',
        'uiModule': 'services/uiModule',
        'applicationController': 'app_module/controllers/applicationController'
    },
    shim: {
        "ng-multiselect": ['lodash'],
        "angular-animate": ['angular'],
        "toaster": ['angular'],
        "ng-tree": ['jstree'],
        "jstree" : ['jquery'],
        "ngProgress": ['angular'],
        "datePicker": ['angular'],
        "angular-summernote": ['summernote'],
        "bootstrap": ['jquery'],
        "angular": { deps: ['jquery'] , init: function() {return this.angular}},
        "sha1": ['angular'],
        "angular_ngMock": ['angular'],
        "angularAMD": ["angular"],
        "ui-router": ["angular"],
        "servicesModule": ['angular'],
        "uiModule": ['angular'],
        "ngStorage": ['angular'],
        "ngGallery" : {
            deps: ['angular']
        },
    },

    deps: ['./app']
});