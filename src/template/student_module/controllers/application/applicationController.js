/**
 * Created by trananhgien on 4/4/2016.
 */

define([], 
  function () {
        function applicationController($scope, jobService, utils, $state, toaster) {
            $scope.noteSkill = '';
            /*jobService.get(PreviousState.params.jobId)
                .then(function (job) {
                    $scope.job = job;
                })*/

            // setup for modal, set modal attribute 'modal' to modal
            $scope.modal = {
                title: 'Choose CV File',
                show: function () {

                },
                hide: function () {

                },
                oncancel: function () {
                    if ($scope.fileIndex != -1) return;
                    $scope.reset();
                },
                onok: function () {
                    console.log($scope.fileIndex, $scope.fileIndexTemp);
                    $scope.fileIndex = $scope.fileIndexTemp;
                    console.log($scope.fileIndex, $scope.fileIndexTemp);
                }

            }


            $scope.errors = {
                toString: function () {
                    var text = '';
                    for (var pro in this) {
                        if (this.hasOwnProperty(pro) && typeof this[pro] != "function") {
                            text += this[pro] + '\n';
                        }
                    }
                    return text.replace(/\n$/, "");
                },

                clear: function () {
                    for (var pro in this) {
                        if (this.hasOwnProperty(pro) && typeof this[pro] != "function") {
                            this[pro] = '';
                        }
                    }
                },

                file: ''
            };


            utils.getFiles().then(function(files) {
                console.log("Application files", files);
                $scope.files = files; 
            });
            

            $scope.fileIndex = -1;
            $scope.fileIndexTemp = -1;
            $scope.setFileIndex = function (idex) {
                $scope.fileIndexTemp = idex;
            }

            $scope.application = {
                file_name: ''
            }

            $scope.reset = function () {
                $scope.fileIndex = -1;
                $scope.fileIndexTemp = -1;
                $scope.fileUpload = undefined;
            }


            $scope.submitApplication = function () {
                console.log($scope.fileIndex, $scope.fileUpload);
                // validate form
                if ($scope.fileIndex == -1 && !$scope.fileUpload) {
                    $scope.errors.file = 'Please choose CV file'
                    return;
                }

                console.log($scope.fileUpload);

                var data = {
                    note: $scope.noteSkill,
                    jobid: $scope.job.id
                }

                if ($scope.fileIndex != -1) {
                    data.fileid = $scope.files[$scope.fileIndex].id;
                } else if ($scope.fileUpload) {
                    data.upload = $scope.fileUpload;
                }

                jobService.apply(data)
                    .then(function(result) {
                        console.log("Result Apply", result);
                        //alert("Check");
                        if (!result.error) {
                          toaster.pop("success", "Success", "Apply Job Successfully");
                          $state.go('app.dashboard.job');
                        }
                        else toaster.pop("error", "Oops!", "Something wrong!");
                    });
            }
        }
        
          applicationController.$inject = ['$scope', 'jobService', 'utils', '$state', 'toaster'];
          
          return applicationController;
});