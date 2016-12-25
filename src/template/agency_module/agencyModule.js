define([
  'app',
  'agency_module/controllers/dashboard/job/jobController',
  'agency_module/controllers/dashboard/job/jobCreateController',
  'agency_module/controllers/dashboard/job/jobDetailController',
  'agency_module/controllers/dashboard/profile/profileController',
  'agency_module/controllers/dashboard/profile/createProfileController',
  'agency_module/controllers/dashboard/dashboardController'
], function(app, jobCtrl, jobCreateCtrl, jobDetailCtrl, profileCtrl, createProfileCtrl, dashboardCtrl) {
  
  app.controller('agencyJobController', jobCtrl)
  .controller('agencyJobCreateController', jobCreateCtrl)
  .controller('agencyJobDetailController', jobDetailCtrl)
  .controller('agencyProfileController', profileCtrl)
  .controller('agencyCreateProfileController', createProfileCtrl)
  .controller('agencyDashboardController', dashboardCtrl);
  
  return app;
  
});

require(['agency_module/agencyModule'], function(app) {});