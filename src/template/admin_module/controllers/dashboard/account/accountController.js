define(['app'], function(app) {
  function accountCtrl(vm, searchService, utils, toaster, NgTableParams, $stateParams, $state) {
    vm.searchMode = "agency";
    vm.candidates = [];
    vm.agencies = [];
    
    vm.agencyTableParams = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});
    vm.candidateTableParams = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});
    vm.lastId = -1;
    
    var params = $stateParams;
    
    if (params.keyword && params.usertype) {
      vm.searchMode = params.usertype;
      search(params);
    }
    
    vm.search = function() {
      params = {keyword: vm.searchText, usertype: vm.searchMode};
      $state.go('app.dashboard.account', params, {location: true, notify: false, reload: false});
      search(params);
    };
            
    function search(params) {
      var text = params.keyword;
      var searchMode = params.usertype;
      var promise = searchMode === "agency" ? searchService.searchAgency(text, vm.lastId) : searchService.searchCandidate(text, vm.lastId);

      promise.then(function(res) {
        res = res.data;
        if (res.success !== 0) return toaster.pop('error', 'Error', utils.getError(res.success));
        console.log("data", res.data);
        vm.lastId = res.data.last_id;
        
        setData(res.data.data);
      });
    };
    
    function getTableParams() {
      return vm.searchMode === "agency" ? vm.agencyTableParams : vm.candidateTableParams;
    }
    
    function setData(data) {
      var index = 'agencies';
      if (vm.searchMode === 'candidate'){
        index = 'candidates';
      }
      
      vm[index] = data;
      
      getTableParams().settings({data: vm[index]});
    }
  }
  
  accountCtrl.$inject = ['$scope', 'searchService', 'utils', 'toaster', 'NgTableParams', '$stateParams', '$state'];
  app.controller('adminAccountController', accountCtrl);
});