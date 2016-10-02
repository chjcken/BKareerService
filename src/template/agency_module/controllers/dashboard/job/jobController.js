/**
 * Created by trananhgien on 4/10/2016.
 */

define([
  'app', 
  'angular', 
  'directives/view-create-job/view-create-job', 
  'directives/tab/tabset',
  'directives/form-view-edit/form-view-edit'
], function(app, angular) {
    var jobController = function($scope, utils, jobService, $timeout, $state, NgTableParams, $filter, criteria) {
        $scope.setCurrentTabIndex(1);
        $scope.locations = [];
        $scope.tags = [];
        $scope.jobs = [];
        $scope.job = {};
        $scope.jobModel = {};
        
        var req = utils.Request.create(false);
        
        req.addRequest(utils.getLocations());
        req.addRequest(utils.getTags());
        
        req.all()
        .then(function(result) {
            if (result.error) {alert('Loi server');}
            else {
                console.log(result);
                $scope.locations = result[0];
                $scope.tags = result[1];
            }
        });
        
        $scope.submitPromise = null;    
        $scope.submit = function() {
          console.log("Job model", $scope.jobModel);
          var jobModel = $scope.jobModel;
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
          var newCriteriaValues = criteria.createListData($scope).addList;
          console.log("new criteria values", newCriteriaValues);
          
          $scope.submitPromise = req.all().then(function(result) {
              if (result.error) {
                  alert(result.error);
              } else {
                  alert("Create Job Successfully");
                  criteria.addJobCriteria(result[0].id, newCriteriaValues)
                    .then(function(res) {
                      if (res.data.success === 0) {
                        $state.go('app.home.job', {jobId: result[0].id});
                      } else {
                        alert("Add criteria error code = " + res.data.success);
                      }
                    });
                  
              }

          });
        };
        

        
        var getData = function() {
          var req = utils.Request.create();
          req.addRequest(jobService.getAgencyJobs());
          req.addRequest(criteria.getAllCriteria());
          return req.all().then(function(result) {
            console.log('get agency job', result);
            if (result.error) {
                alert("Error " + result.error);
                return [];
            }

            var jobData = result[0];
            angular.forEach(jobData, function(value) {
               value.post_date_string = $filter('date')(value.post_date, 'MM/dd/yyyy');
               value.expire_date_string = $filter('date')(value.expire_date, 'MM/dd/yyyy');
               value.is_close = value.is_close || value.expire_date < (new Date()).getTime() ? 1 : 0;
            });
            
            $scope.tableParams.settings({data: jobData});
            
            var criterias = {name: "root", data: result[1]};
            criteria.create($scope, criterias);
            $scope.sections = criterias.data;
          });
        };
        
        $scope.tableParams = new NgTableParams();
        
        getData();
        
        
    };
    
    jobController.$inject = ['$scope', 'utils', 'jobService', '$timeout', '$state', 'NgTableParams', '$filter', 'criteria'];
    
    app.controller('agencyJobController',jobController);

});