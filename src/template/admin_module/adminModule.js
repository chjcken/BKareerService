define([
  'app',
  'admin_module/controllers/dashboard/dashboardController',
  'admin_module/controllers/dashboard/account/accountCreateController',
  'admin_module/controllers/dashboard/account/accountManagementController',
  'admin_module/controllers/dashboard/account/editAccountController',
  'admin_module/controllers/dashboard/criteria/criteriaController',
  'admin_module/controllers/dashboard/job/jobController',
  'admin_module/controllers/dashboard/job/jobDetailController',
  'admin_module/controllers/dashboard/statistic/statisticController',
  'admin_module/controllers/dashboard/job/jobRequestController'
  
], function(app, dashboard, acc, accM, editAcc, criteria, job, jobDetail, stat, jobReq) {
  
  app.controller('adminDashboardController', dashboard)
  .controller('adminAccountCreateController', acc)
  .controller('adminAccountManagementController', accM)
  .controller('adminEditAccountController', editAcc)
  .controller('adminCriteriaController', criteria)
  .controller('adminJobController', job)
  .controller('adminJobRequestController', jobReq)
  .controller('adminJobDetailController', jobDetail)
  .controller('adminStatisticController', stat);
  
});

// init admin module
require(['admin_module/adminModule'], function() {});
