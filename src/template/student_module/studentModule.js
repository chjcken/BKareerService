define([
  'app',
  'student_module/controllers/application/applicationController',
  'student_module/controllers/dashboard/dashboardController',
  'student_module/controllers/dashboard/file/fileController',
  'student_module/controllers/dashboard/job/jobController',
  'student_module/controllers/dashboard/job/jobDetailController',
  'student_module/controllers/dashboard/preference/preferenceController',
  'student_module/controllers/dashboard/profile/profileController',
], function(app, appCtrl, dashboard, file, job, jobDetail, prefer, profile) {
  app.controller('studentApplicationController', appCtrl)
          .controller('studentDashboardController', dashboard)
          .controller('studentFileController', file)
          .controller('studentJobController', job)
          .controller('studentPreferenceController', prefer)
          .controller('studentJobDetailController', jobDetail)
          .controller('studentProfileController', profile);
  
  return app;
});

// init module
require(['student_module/studentModule'], function() {});