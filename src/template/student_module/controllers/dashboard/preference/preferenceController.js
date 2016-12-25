/**
 * Created by trananhgien on 4/10/2016.
 */

define([

  ], 
  function() {
    function preferenceController(vm, NgTableParams, utils, criteria, notification, jobService, $stateParams) {
      vm._dashboardSetTabName("preferences");
      var reqNoti = utils.Request.create();
      var reqCriterias = utils.Request.create(false);
      var notiId = $stateParams.notiid;
      reqCriterias.addRequest(criteria.getStudentCriteria());
      
      if (notiId) {
        reqNoti.addRequest(notification.getNotiById(notiId));
        reqNoti.all()
          .then(function(res) {
            if (res.error) {
              return alert("ERR: " + res.error);
            }
            getJobs(res[0].data)
              .then(function() {
                notification.seenNoti(notiId);
              });
            
          });
      }
      

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
        
        return jobService.getList(jobIds)
          .then(function(res) {
            if (res.error) {
              alert("ERR: " + res.error);
             return false;
            }
            vm.jobs = res.data.data;
            return true
         });
      }
      
      vm.updateCriteria = updateCriteria;
      vm.getSuitableJob = getSuitableJob;
    }
  
  preferenceController.$inject = [
    "$scope", 
    "NgTableParams", 
    "utils", 
    "criteria", 
    "notification", 
    "jobService",
    "$stateParams"
  ];
  
  return preferenceController;
});