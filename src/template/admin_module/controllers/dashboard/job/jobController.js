/**
 * Created by trananhgien on 9/7/2016.
 */
define([
  'app'
], function(app) {

  function adminJobController(vm, NgTableParams, searchService) {
    vm.listJobs = [];
    vm.currentDate = new Date();
    vm.cities = [
      {
        name: "All",
        districts: [
          {
            name: "All"
          }
        ]
      },
      {
        name: "Ho Chi Minh",
        districts: [
          {
            name: "All"
          },
          {
            name: "Tan Binh"
          },
          {
            name: "Binh Thanh"
          },
          {
            name: "Dist. 10"
          }
        ]
      },
      {
        name: "Ha Noi",
        districts: [
          {
            name: "All"
          },
          {
            name: "Hoan Kiem"
          },
          {
            name: "Thong Nhat"
          },
          {
            name: "Hang Be"
          }
        ]
      }
    ];
    
    vm.agencies = [
      {
        id: -1,
        name: "All"
      },
      {
        id: 1,
        name: "TMA Solution"
      },
      {
        id: 2,
        name: "FPT"
      },
      {
        id: 3,
        name: "DEK"
      }
    ];
    
    vm.filter = {
      city: vm.cities[0],
      district: vm.cities[0].districts[0],
      agencies: []
    };
    
    var getData = function() {
      var req = utils.Request.create();
      req.addRequest(jobService.getAll({
        limit: 100,
        page: 1
      }));
      return req.all().then(function(result) {
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

        vm.tableParams.settings({data: jobData});
      });
    };

    vm.tableParams = new NgTableParams();

    getData();
  }
  
  adminJobController.$inject = ["$scope", "searchService", "NgTableParams"];
  app.controller('adminJobController', adminJobController);

});
