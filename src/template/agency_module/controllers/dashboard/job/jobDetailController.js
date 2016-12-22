/**
 * Created by trananhgien on 5/24/2016.
 */

define([
  'app',
  'directives/view-create-job/view-create-job',
  'directives/form-view-edit/form-view-edit',
  'directives/tab/tabset',
  'directives/modal/modal'
], function(app) {

    function jobDetailController(vm, $stateParams, jobService, utils, criteria, notification, searchService, NgTableParams, toaster, $state) {
        var notiId = $stateParams.notiid;
        var notiType = $stateParams.notitype;
        var jobId = $stateParams.jobId;
        var notiId = $stateParams.notiid;
        var students = [];
        var req = utils.Request.create();
        vm.notiType = notiType;
        vm.job = {};
        vm.jobModel = {};
        vm.locations = [];
        vm.tags = [];
        vm.sectionName = "NORMAL";
        vm.tableParams = new NgTableParams();
        vm.currentTab = 0;
        vm.modal = {
          title: "Confirm",
          hideCancel: false,
          show: function() {},
          hide: function() {},
          oncancel: function() {},
          onok: function() {
            var student = vm.message.data;
            switch(vm.message.action) {
              case 'close-job': 
                vm.updateJob(true);
                break;
              case 'deny':
                var req = utils.Request.create(false);
                req.addRequest(jobService.deny({jobid: jobId, studentid: student.id}));
                student.promise = req.all().then(function(result){
                            if (result.error) {
                                alert(result.error);
                                return;
                            }
                            student.status = 'DENY';
                            toaster.pop('success', student.name + " was denied");
                        });
                break;
                
              case 'approve':
                var req = utils.Request.create(false);
                req.addRequest(jobService.approve({jobid: jobId, studentid: student.id}));
                student.promise = req.all().then(function(result){
                            if (result.error) {
                                alert(result.error);
                                return;
                            }
                            student.status = 'APPROVE';
                            toaster.pop('success', student.name + " was approved");
                        });
                break;
            }
            
            $state.go('app.dashboard.jobdetail', {jobId: jobId}, {reload: true});
            
          }
        };
        vm.action = "close-job";
        vm.message = "Do you want to close this job?";
        
        
        
        if (notiId) {
          if (notiType === "candidate") {
            vm.sectionName = "NOTI_CANDIDATE";
            notification.getNotiById(notiId)
              .then(function(res) {
                console.log("-->getNotiWithId-->", res);
                if (res.data.success !== 0) return;
                
                var candidateIds = res.data.data.data.data;
                return searchService.getCandidates(candidateIds)
                  .then(function(result) {
                    if (result.data.success != 0) {
                      return alert("ERR ");
                    }
                    
                    return result.data.data;
                  });
              }).then(function(candidates) {
                vm.tableParams.settings({data: candidates});
                notification.seenNoti(notiId);
              });
              
          } else if (notiType === 'jobedited') {  
            vm.reasonMsg = "";
            notification.getNotiById(notiId)
                    .then(function(res) {
                      res = res.data;
                      console.log("hahahahah", res);
                      vm.reasonMsg = res.data.data.msg;
                      console.log("hehehehe", vm.reasonMsg);
                      notification.seenNoti(notiId);
                    });
          } else {
            notification.seenNoti(notiId);
          }
        }
        
        req.addRequest(utils.getLocations());
        req.addRequest(jobService.get(jobId));
        
        req.all().then(function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            
            vm.locations = result[0];
            console.log("get locations DEAILT ", vm.locations);
            vm.job = result[1];
            students = vm.job.applied_students || [];
            
            vm.students = students;
            var city = vm.locations[utils.containsObject(vm.locations, vm.job.location.city.id, "id")];
            console.log("city -->", city);
            var district = city.districts[utils.containsObject(city.districts, vm.job.location.district.id, "id")];
            
            vm.jobModel = {
              title: vm.job.title,
              salary: vm.job.salary,
              address: vm.job.location.address,
              city: city,
              district: district,
              expire: vm.job.expire_date,
              desc: vm.job.full_desc,
              requirement: vm.job.requirement,
              benifits: vm.job.benifits,
              tags: vm.job.tags,
              isinternship: false
            };
            
            console.log("jobModel", vm.jobModel);
            
            req.init(false);
            
            req.addRequest(utils.getTags());
            req.addRequest(criteria.getJobCriteria(jobId));
            req.all().then(function(result) {
              
              vm.tags = result[0];
              var criterias = {name: "root", data: result[1]};
              criteria.create(vm, criterias);
              vm.sections = criterias.data;
            });
            
        });

        vm.loadDetail = function(student) {
            if (student.promise !== undefined) return;
            var req = utils.Request.create(false);
            req.addRequest(jobService.getApplyDetail({jobid: jobId, studentid: student.id}));
            student.promise = req.all().then(function(result){
                        if (result.error) {
                            alert(result.error);
                            return;
                        }
                        
                        student.file = result[0].file;
                        student.note = result[0].note;
                    });
        };
        
        vm.deny = function(student) {
            vm.message = {
              text: "Are you sure to deny this candidate?",
              action: 'deny',
              data: student
            };
            
            vm.modal.show();            
        };
        
        vm.approve = function(student) {
          vm.message = {
              text: "Do you want to approve this candidate?",
              action: 'approve',
              data: student
            };
            
            vm.modal.show();
        };
        
        vm.updateJob = function(isClose) {
          var updateJobData = {};
                    
          angular.copy(vm.jobModel, updateJobData);
          if (isClose) {
            updateJobData.isclose = true;
          }

          updateJobData.expiredate = new Date(updateJobData.expire).getTime();
          
          updateJobData.jobid = jobId;
          updateJobData.cityid = updateJobData.city.id;
          updateJobData.districtid = updateJobData.district.id;
          
          delete updateJobData['city'];
          delete updateJobData['district'];
          delete updateJobData['expire'];
          
          req.init(true);
          req.addRequest(jobService.updateJob(updateJobData));
          req.all()
            .then(function(result) {
              if (result.error) {
                alert("Error " + result.error);
                return;
              }
              
              var criteriaValues = criteria.createListData(vm);
              
              console.log("new criteria values", criteriaValues);
              req.init(false);
              if (criteriaValues.addList.length > 0) {
                req.addRequest(criteria.addJobCriteria(jobId, criteriaValues.addList));
              }
              
              if (criteriaValues.updateList.length > 0) {
                req.addRequest(criteria.updateJobCriteria(criteriaValues.updateList));
              }
              req.all().then(function(res) {
                if (res.error) {
                  toaster.pop('error', 'Error', res.error);
                  return;
                }
                
                toaster.pop('success','Success', 'Update Job Successfully');
              });
            });
        };
        
        vm.openFormEdit = function(isOpen) {
          vm.sectionName = isOpen ? "EDIT" : "NORMAL";
        };
        
        vm.closeJob = function() {
          vm.modal.show();
        };
        
        vm.find = function() {
          jobService.getSuitableCandidate(jobId)
              .then(function(res) {
              });

        };
        
        window.vm = vm;

    };
    
    jobDetailController.$inject = ["$scope", "$stateParams", "jobService", "utils", "criteria", "notification", "searchService", "NgTableParams", "toaster", "$state"];
    app.controller('agencyJobDetailController', jobDetailController);
});