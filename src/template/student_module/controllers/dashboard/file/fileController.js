/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'directives/modal/modal', 'directives/file-grid/file-grid'], function(app) {

    app.controller('studentFileController', function($scope, screenResolution) {

        $scope.setCurrentTabIndex(3);
        
        $scope.currentFile;
        $scope.files = [
            {id: '1', name: 'File cv name', type: 'pdf', size: '20Kb', upload_date: 1463978327536},
            {id: '2', name: 'File cv name', type: 'pdf', size: '22Kb', upload_date: 1463978327400},
            {id: '3', name: 'File cv name', type: 'docx', size: '24Kb', upload_date: 1463978327000},
            {id: '4', name: 'File cv name 3', type: 'pdf', size: '200Kb', upload_date: 1463978327536},
            {id: '5', name: 'File cv name 4', type: 'pdf', size: '225Kb', upload_date: 1463978327400},
            {id: '6', name: 'File cv name 5', type: 'docx', size: '234Kb', upload_date: 1463978327000}
        ];


        $scope.modal = {
            title: 'Ahihi'
        };

        $scope.showFileDetail = function(file) {
            $scope.currentFile = file;

            if (screenResolution('xs')) {
                $scope.modal.show();
            }
        }

        $scope.downloadFile = function(file) {
            alert("Download...");
        };

    });

});