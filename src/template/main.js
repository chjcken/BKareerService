/**
 * Created by trananhgien on 3/13/2016.
 */

require.config({
	baseUrl: '.',
    paths: {
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