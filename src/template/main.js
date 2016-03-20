/**
 * Created by trananhgien on 3/13/2016.
 */

require.config({
    paths: {
        'hashes': 'libs/hashes',
        'sha1': 'libs/sha1',
        'angular_ngMock': 'libs/angular-mocks',
        'angular': 'libs/angular',
        'angularAMD': 'libs/angularAMD',
        'ui-router': 'libs/angular-ui-router.min',
        'servicesModule': 'providers/servicesModule',
        'studentModule': 'student_module/studentModule',
        'AuthService': 'services/AuthService',
        'applicationController': 'app_module/controllers/applicationController'
    },
    shim: {
        "sha1": ['angular'],
        "angular_ngMock": ['angular'],
        "angularAMD": ["angular"],
        "ui-router": ["angular"],
        "servicesModule": ['angular'],
    },

    deps: ['./app']
});