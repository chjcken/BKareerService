/**
 * Created by trananhgien on 3/14/2016.
 */

/**
 * require sha1 module that defines angular-sha1 module and sha1 factory
 */

define(['angularAMD', 'angular', 'sha1'], function(angularAMD) {

    console.log('Enter routeResolver');

    var routeConfig = function() {
        var viewsDirectory = '/views/',
            controllersDirectory = '/controllers/',
            moduleDirectory = '';

        setBaseDirectories = function(moduleDir, viewsDir, controllersDir) {
            viewsDirectory = viewsDir || viewsDirectory;
            controllersDirectory = controllersDir || controllersDirectory;
            moduleDirectory = moduleDir;
        };

        getViewsDirectory = function() {
            return viewsDirectory;
        };

        getControllersDirectory = function() {
            return controllersDirectory;
        };

        getModuleDirectory = function() {
            return moduleDirectory;
        };

        return {
            setBaseDirectories: setBaseDirectories,
            getControllersDirectory: getControllersDirectory,
            getViewsDirectory: getViewsDirectory,
            getModuleDirectory: getModuleDirectory
        };
    }();

    var route = function(routeObj) {
        if (!routeObj.path) routeObj.path='';

        var routeDef = {};
        routeDef.templateUrl = routeConfig.getModuleDirectory() + routeConfig.getViewsDirectory()
            + routeObj.path + routeObj.baseName + '.html';

        routeDef.controllerUrl = routeConfig.getModuleDirectory() + routeConfig.getControllersDirectory()
            + routeObj.path + routeObj.baseName + 'Controller';
        routeDef.controller = routeObj.baseName + 'Controller';
        routeDef.secure = routeObj.secure ? routeObj.secure : false;
        routeDef.abstract = routeObj.abstract ? routeObj.abstract : false;
        routeDef.url = routeObj.url;

        return angularAMD.route(routeDef);
    };

    var routeResolver = function() {
        return {
            $get: function() {

            },
            routeConfig: routeConfig,
            route: route
        };
    };

    var servicesApp = angular.module('servicesModule', ['angular-sha1']);

    servicesApp.provider('routeResolver', routeResolver);

    return servicesApp;
});