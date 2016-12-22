/**
 * Created by trananhgien on 7/1/2016.
 */

module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        requirejs: {
            devApp: {
                options: {
                    baseUrl: ".",
                    mainConfigFile: "main.js",
                    out: "./dist/applicationModule.min.js",
                    name: './app_module/applicationModule',
                    include: ['./main'],
                    //exclude: ['app'],
                    optimize: 'none'
                }
            },
            devStu: {
                options: {
                    baseUrl: "./public",
                    mainConfigFile: "./public/main.js",
                    out: "./public/dist/studentModule.min.js",
                    name: 'studentModule',
                    //include: ['./main'],
                    exclude: ['app'],
                    optimize: 'none'
                }
            },
            devAge: {
                options: {
                    baseUrl: "./public",
                    mainConfigFile: "./public/main.js",
                    out: "./public/dist/agencyModule.min.js",
                    name: 'agencyModule',
                    //include: ['./main'],
                    exclude: ['app'],
                    optimize: 'none'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    function dev(mode) {
        switch (mode) {
            case 1: return ['requirejs:devApp'];
            case 2: return ['requirejs:devApp', 'requirejs:devStu'];
            case 3: return ['requirejs:devApp', 'requirejs:devStu', 'requirejs:devAge'];
        }
    }

    grunt.registerTask('default',dev(1));
    //grunt.registerTask('release',['requirejs:release','express:dev','express-keepalive']);
}
