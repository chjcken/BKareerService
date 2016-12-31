/**
 * Created by trananhgien on 5/24/2016.
 */

define([
  
], function() {

    function jobDetailController(vm, $stateParams, jobService, utils, criteria, toaster) {

        var jobId = $stateParams.jobId;
        var students = [];
        var req = utils.Request.create();
        vm.job = {};
        vm.jobModel = {};
        vm.reason = {
          msg: ""
        };
        vm.locations = [];
        vm.tags = [];
        vm.isEdit = false;
        vm.currentTab = 0;
        
        
        vm.modal = {
          title: "Please fill out the reason",
          show: function() {},
          hide: function() {},
          ooncancel: function() {},
          onok: function() {
            vm.updateJob(vm.job.status === 1);
          }
        };
        
        req.addRequest(utils.getLocations());
        req.addRequest(jobService.get(jobId));
        
        req.all().then(function(result) {
            if (result.error) {
                alert(result.error);
                return;
            }
            
            vm.locations = result[0];
            vm.job = result[1];
            vm.isEdit = vm.job.status === 2;
            students = vm.job.applied_students || [];
            vm.students = students;
            var city = vm.locations[utils.containsObject(vm.locations, vm.job.location.city.id, "id")];
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
            var r = confirm("Are you sure to deny student " + student.name);
            if (!r) return;
            
            var req = utils.Request.create(false);
            req.addRequest(jobService.deny({jobid: jobId, studentid: student.id}));
            student.promise = req.all().then(function(result){
                        if (result.error) {
                            alert(result.error);
                            return;
                        }
                        student.status = 'DENY';
                        alert("Success");
                    });
        };
        
        vm.approve = function(student) {
            var r = confirm("DO you want to approve student " + student.name);
            if (!r) return;
            
            var req = utils.Request.create(false);
            req.addRequest(jobService.approve({jobid: jobId, studentid: student.id}));
            student.promise = req.all().then(function(result){
                        if (result.error) {
                            alert(result.error);
                            return;
                        }
                        student.status = 'APPROVE';
                        alert("Success");
                    });
        };
        
        vm.fillReason = function() {
          vm.modal.show();
        };
        
        vm.activeJob = function() {
          jobService.activeJob(vm.job.id)
            .then(function(res) {
              res = res.data;
              if (res.success !== 0) {
                return toaster.pop('error', 'ERROR', 'Active job failed\n' + utils.getError(res.success));
              }

              toaster.pop('success', '', 'Job "' + vm.job.title + '" actived');
              
            });
        };
        
        vm.closeJob = function() {
          vm.job.status = 1;
          vm.fillReason();
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
          updateJobData.msg = vm.reason.msg;
          
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
//              return;
              req.init(false);
              if (criteriaValues.addList.length > 0) {
                req.addRequest(criteria.addJobCriteria(jobId, criteriaValues.addList));
              }
              
              if (criteriaValues.updateList.length > 0) {
                req.addRequest(criteria.updateJobCriteria(criteriaValues.updateList));
              }
              req.all().then(function(res) {
                if (res.error) {
                  alert("Error " + res.error);
                  return;
                }
                
                toaster.pop("success", "Success");
              });
            });
        };
        
        vm.openFormEdit = function(isOpen) {
          vm.isEdit = isOpen;
        };
        window.scope = vm;
    };
    
    jobDetailController.$inject = ["$scope", "$stateParams", "jobService", "utils", "criteria", "toaster"];
    return jobDetailController;
});