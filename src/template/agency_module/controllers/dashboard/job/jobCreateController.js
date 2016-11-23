define([
  'app',
  'directives/view-create-job/view-create-job',
  'directives/tab/tabset',
  'directives/form-view-edit/form-view-edit',
  'directives/search-bar/search-bar',
  'directives/modal/modal'
], function(app) {
  
  function createJobCtrl(vm, utils, jobService, $state, criteria) {
//    vm._dashboardSetTabName("job-create");
    vm.currentTab = 0;
    vm.locations = [];
    vm.tags = [];
    vm.job = {};
    vm.jobModel = {};
    var createdJobId;
    
    vm.modalData = {
      hideCancel: false,
      onok: function() {
        jobService.getSuitableCandidate(createdJobId)
          .then(function(res) {
            $state.go('app.home.job', {jobId: createdJobId});
          });
      }
    };

    var req = utils.Request.create(false);

    req.addRequest(utils.getLocations());
    req.addRequest(utils.getTags());
    req.addRequest(criteria.getAllCriterias());

    req.all()
    .then(function(result) {
        if (result.error) {alert('Loi server');}
        else {
            console.log(result);
            vm.locations = result[0];
            vm.tags = result[1];
            
            var criterias = {name: "root", data: result[2]};
            criteria.create(vm, criterias);
            vm.sections = criterias.data;
        }
    });
    
    vm.activeTab = function(index) {
      console.log("active tab", index);
      vm.currentTab = index;
    };
    
    vm.submitPromise = null;    
    vm.submit = function() {
      console.log("Job model", vm.jobModel);
      var jobModel = vm.jobModel;
      var data = {
          title: jobModel.title,
          salary: jobModel.salary,
          address: jobModel.address,
          cityid: jobModel.city.id,
          districtid: jobModel.district.id,
          expiredate: new Date(jobModel.expire).getTime(),
          desc: jobModel.desc,
          requirement: jobModel.requirement,
          benifits: jobModel.benifits,
          tags: jobModel.tags,
          isinternship: false
      };
      req.init(false);
      req.addRequest(jobService.createJob(data));
      var newCriteriaValues = criteria.createListData(vm).addList;
      console.log("new criteria values", newCriteriaValues);

      vm.submitPromise = req.all().then(function(result) {
          if (result.error) {
              alert(result.error);
          } else {
              criteria.addJobCriteria(result[0].id, newCriteriaValues)
                .then(function(res) {
                  if (res.data.success === 0) {
                    vm.modalData.show();
                    createdJobId = result[0].id;
//                      $state.go('app.home.job', {jobId: result[0].id});
                  } else {
                    alert("Add criteria error code = " + res.data.success);
                  }
                });

          }

      });
      
      
    };
  }
  
  createJobCtrl.$inject = ['$scope', 'utils', 'jobService', '$state', 'criteria'];
  app.controller('agencyJobCreateController', createJobCtrl);
});