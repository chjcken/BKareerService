/**
 * Created by trananhgien on 4/10/2016.
 */

define(['app', 'directives/modal/modal', 'directives/file-grid/file-grid'], function(app) {

    function studentFileController($scope, screenResolution, utils, $window, $state, toaster) {

        $scope._dashboardSetTabName("files");
        
        $scope.currentFile;
        $scope.files = [];
        
        utils.getFiles().then(function(files) {
                console.log("files CV", files);
                angular.forEach(files, function(f) {
                    var lastIndex = f.name.lastIndexOf('.');
                    if (lastIndex > -1) {
                        f.type = f.name.substring(lastIndex + 1);
                        f.name = f.name.substring(0, lastIndex);
                    }
                });
                $scope.files = files; 
            });

        $scope.modal = {
            title: 'File name'
        };

        $scope.showFileDetail = function(file) {
            $scope.currentFile = file;

            if (screenResolution('xs')) {
                $scope.modal.show();
            }
        }

        $scope.downloadFile = function(file) {
            //alert("Download...");
            $window.location.href = file.url;
        };
           
        $scope.deleteFile = function(file) {
            utils.removeFile(file.id).then(function(res) {
              res = res.data;
              if (res.success !== 0) {
                return toaster.pop('error', 'Fail: ' + utils.getError(res.success));
              }
              
              toaster.pop('success', "Remove file successully");
              
              $state.go('app.dashboard.files', {}, {reload: true});
            });
        };
        
        $scope.fileContextDownload = function(file) {
          $scope.downloadFile(file);
        };
        
        $scope.fileContextDelete = function(file) {
          $scope.deleteFile(file);
        };
    }
    
    studentFileController.$inject = ['$scope', 'screenResolution', 'utils', '$window', '$state', 'toaster'];
    
    app.controller('studentFileController', studentFileController);

});