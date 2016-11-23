/**
 * Created by trananhgien on 5/24/2016.
 */

define([
  'app',
  'directives/view-create-job/view-create-job',
  'directives/form-view-edit/form-view-edit'
], function(app) {

    function jobDetailController(vm, $stateParams, jobService, utils, criteria, notification, searchService, NgTableParams) {
        var notiId = $stateParams.notiid;
        var notiType = $stateParams.notitype;
        
        console.log("--jobDetail Noti-->", notiId, notiType);
        var jobId = $stateParams.jobId;
        var notiId = $stateParams.notiid;
        var students = [];
        var req = utils.Request.create();
        vm.job = {};
        vm.jobModel = {};
        vm.locations = [];
        vm.tags = [];
        vm.sectionName = "NORMAL";
        vm.tableParams = new NgTableParams();

        if (notiId) {
          if (notiType == "candidate") {
            console.log("noti candidate");
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
            console.log("get locations ", vm.locations);
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
        
        vm.updateJob = function() {
          var updateJobData = {};
          angular.copy(vm.jobModel, updateJobData);
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
                  alert("Error " + res.error);
                  return;
                }
                
                alert("Success");
              });
            });
        };
        
        vm.openFormEdit = function(isOpen) {
          vm.sectionName = isOpen ? "EDIT" : "NORMAL";
        };
        
        vm.test = function() {
          jobService.getSuitableCandidate(jobId)
              .then(function(res) {
              });

        };
        
        window.vm = vm;

    };
    
    jobDetailController.$inject = ["$scope", "$stateParams", "jobService", "utils", "criteria", "notification", "searchService", "NgTableParams"];
    app.controller('agencyJobDetailController', jobDetailController);
});