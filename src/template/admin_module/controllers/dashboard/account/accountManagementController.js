define([
  'app',
  'directives/tab/tabset'
], function(app) {
  function accountCtrl(vm, searchService, utils, toaster, NgTableParams, $stateParams, $state, user) {
    vm.searchMode = "agency";
    vm.candidates = [];
    vm.agencies = [];
    
    vm.agencyTableParams = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});
    vm.candidateTableParams = new NgTableParams({ count: 10 }, { counts: [10, 20, 30]});
    vm.lastId = -1;
    vm.candidateLastId = -1;
    vm.isNotFound = false;
    vm.currentTab = 0;
    
    var params = $stateParams;
    
    if (params.keyword && params.usertype) {
      vm.searchMode = params.usertype;
      search(params);
    }
    
    vm.search = function() {
      params = {keyword: vm.searchText, usertype: vm.searchMode};
      $state.go('app.dashboard.accountmanagement', params, {location: true, notify: false, reload: false});
      search(params);
    };
    
    vm.loadMore = function() {
      params = {keyword: vm.searchText || params.keyword, usertype: vm.searchMode};
      search(params, true);
    };
    
    vm.banAccount = function(id, role) {
      user.banAccount(id, role).then(function(res) {
        res = res.data;
        if (res.success !== 0) {
          return toaster.pop('error', '', 'fail');
        }
        
        toaster.pop('success', "", "success");
      });
    };
    
    vm.activeAccount = function(id, role) {
      user.reactiveAccount(id, role).then(function(res) {
        res = res.data;
        if (res.success !== 0) {
          return toaster.pop('error', '', 'fail');
        }
        
        toaster.pop('success', "", "success");
      });
    };
            
    function search(params, isLoadMore) {
      var text = params.keyword;
      var searchMode = params.usertype;
      var promise = searchMode === "agency" ? searchService.searchAgency(text, vm.lastId) : searchService.searchCandidate(text, vm.candidateLastId);

      promise.then(function(res) {
        res = res.data;
        if (res.success !== 0) return toaster.pop('error', 'Error', utils.getError(res.success));
        console.log("data", res.data);
        if (searchMode === 'agency')
          vm.lastId = res.data.last_id;
        else
          vm.candidateLastId = res.data.last_id;
        
        vm.isNotFound = res.data.data.length === 0;
        setData(res.data.data, isLoadMore);
      });
    };
    
    function getTableParams() {
      return vm.searchMode === "agency" ? vm.agencyTableParams : vm.candidateTableParams;
    }
    
    function setData(data, isLoadMore) {
      var index = 'agencies';
      if (vm.searchMode === 'candidate'){
        index = 'candidates';
      }
      if (isLoadMore) {
        vm[index] = vm[index].concat(data);
      } else {
        vm[index] = data;
      }      
      
      getTableParams().settings({data: vm[index]});
    }
  }
  
  accountCtrl.$inject = ['$scope', 'searchService', 'utils', 'toaster', 'NgTableParams', '$stateParams', '$state', 'user'];
  app.controller('adminAccountManagementController', accountCtrl);
});