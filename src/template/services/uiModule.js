/**
 * Created by trananhgien on 4/9/2016.
 */

define(['angularAMD', 'angular', 'angular-summernote', 'datePicker', 'ngProgress'], function() {
    console.log("Angular", angular);
    var UIModule = angular.module('uiModule', ['summernote', '720kb.datepicker', 'ngProgress']);

    return UIModule;
});