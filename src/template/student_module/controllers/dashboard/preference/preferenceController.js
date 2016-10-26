/**
 * Created by trananhgien on 4/10/2016.
 */

define([
    'app',
    'directives/form-view-edit/form-view-edit',
    'directives/tab/tabset',
    'directives/job-grid/job-grid'
  ], 
  function(app) {
    function preferenceController(vm, NgTableParams, utils, criteria, notification, jobService) {
      vm._dashboardSetTabName("preferences");
      var reqNoti = utils.Request.create();
      var reqCriterias = utils.Request.create(false);

      reqNoti.addRequest(notification.getAllNotis());
      reqCriterias.addRequest(criteria.getStudentCriteria());

      reqNoti.all()
       .then(function(res) {
         if (res.error) {
           return alert("ERR: " + res.error);
         }
         for (var i = 0; i < res[0].length; i++) {
           if (res[0][i].type === 1) {
             return getJobs(res[0][i].data);
           }
         }
         
       });

      reqCriterias.all()
        .then(function (res) {
          if (res.error) {
            return alert("ERR: " + res.error);
          }

          var criterias = {name: "root", data: res[0]};
          criteria.create(vm, criterias);
          vm.sections = criterias.data;
        });
        
      function updateCriteria() {
        
        var criteriaValues = criteria.createListData(vm);
        var req = utils.Request.create();
        console.log("---update student criteria-->", criteriaValues);
        
        if (criteriaValues.addList.length > 0) {
          req.addRequest(criteria.addStudentCriteria(criteriaValues.addList));
        }

        if (criteriaValues.updateList.length > 0) {
          req.addRequest(criteria.updateStudentCriteria(criteriaValues.updateList));
        }
        
        req.all().then(function(res) {
          if (res.error) {
            alert("Error " + res.error);
            return;
          }

          alert("Success");
        });
        
      }
      
      function getSuitableJob() {
        var req = utils.Request.create(true);
        req.addRequest(jobService.getSuitableJob());
        req.all()
          .then(function(res) {
            if (res.error) {
              return alert("ERR: " + res.error);
            }
            
          });
      }
      
      function getJobs(jobIds) {
        
        jobService.getList(jobIds)
          .then(function(res) {
            if (res.error) {
              return alert("ERR: " + res.error);
            }
            vm.jobs = res.data.data;
         });
      }
      
      vm.updateCriteria = updateCriteria;
      vm.getSuitableJob = getSuitableJob;
    }
  
  preferenceController.$inject = ["$scope", "NgTableParams", "utils", "criteria", "notification", "jobService"];
  
  app.controller('studentPreferenceController', preferenceController);
});