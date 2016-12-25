/**
 * Created by trananhgien on 7/2/2016.
 */

define(
    [   'app_module/controllers/applicationController',
        'app_module/controllers/jobController',
        'app_module/controllers/newjobsController',
        'app_module/controllers/searchController',
        'app_module/controllers/advertisementController',
        'app_module/controllers/loginController',
        'app_module/controllers/activeController',
        'app_module/controllers/agencyController',
        'app_module/controllers/errorController',
        'app_module/controllers/homeController',
        'app_module/controllers/messageController',
        'app_module/controllers/popularAgencyController',
        'app_module/controllers/registerController',
        'app'
    ],
    function(appCtrl, jobCtrl, newJobsCtrl, searchCtrl, adCtrl, loginCtrl, activeCtrl, agencyCtrl, errorCtrl, homeCtrl, messageCtrl, popularAgencyCtrl, registerCtrl, app) {
        app.controller('applicationController', appCtrl);
        app.controller('loginController', loginCtrl);
        app.controller('jobController', jobCtrl);
        app.controller('newJobsController', newJobsCtrl);
        app.controller('searchController', searchCtrl);
        app.controller('advertisementController', adCtrl);
        app.controller('activeController', activeCtrl);
        app.controller('agencyController', agencyCtrl);
        app.controller('errorController', errorCtrl);
        app.controller('homeController', homeCtrl);
        app.controller('messageController', messageCtrl);
        app.controller('popularAgencyController', popularAgencyCtrl);
        app.controller('registerController', registerCtrl);

        return app;
    }
);

require(['app_module/applicationModule'], function() {});
