define([
], function() {
  function popularAgency(vm, user, utils, toaster) {
    var req = utils.Request.create(true);
    var listAgencies = [];
    var lastIndex = 0;
    req.addRequest(user.getAllAgencies());
    req.all().then(function(res) {
      if (res.error) {
        return toaster.pop("error", res.error);
      }
      
      listAgencies = res[0];
      
      vm.loadMore(0, 12);
      
//      var listRandom = getRandomAgency(12, res[0]);
//      req = utils.Request.create(true);
//
//      angular.forEach(listRandom, function(agency) {
//        req.addRequest(user.getAgency(agency.id));
//      });
//
//      req.all().then(function(res2) {
//        if (res2.error) {
//          return toaster.pop("error", res.error);
//        }
//        console.log("res2", res2);
//        angular.forEach(res2, function(agency) {
//
//          agency.tech_stack = agency.tech_stack ? JSON.parse(agency.tech_stack) : [];
//          console.log("dfasf", agency);
//        });
//
//        vm.agencies = res2;
//      });
    });

    function getRandomAgency(amount, list) {
      var res = [];
      for (var i = 0; i < amount; i++) {
        var index = utils.random(0, list.length);
        res.push(list[index]);
      }

      return res;
    }
    
    vm.loadMore = function() {
      vm.loadingMore = true;
      var listRandom = listAgencies.slice(lastIndex, lastIndex + 12);
      req = utils.Request.create(true);

      angular.forEach(listRandom, function(agency) {
        req.addRequest(user.getAgency(agency.id));
      });

      req.all().then(function(res2) {
        if (res2.error) {
          return toaster.pop("error", res2.error);
        }
        
        angular.forEach(res2, function(agency) {
          agency.tech_stack = agency.tech_stack ? JSON.parse(agency.tech_stack) : [];
        });

        vm.agencies = vm.agencies.concat(res2); 
        lastIndex += 12;
        vm.loadingMore = false;
      });
    };
  }

  popularAgency.$inject = ['$scope', 'user', 'utils', 'toaster'];
  return popularAgency;
});
