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
//                    exclude: ['./init'],
//                     optimize: 'none'
                }
            },
            devStu: {
                options: {
                    baseUrl: ".",
                    mainConfigFile: "main.js",
                    out: "./dist/candidateModule.min.js",
                    name: './student_module/studentModule',
                    //include: ['./main'],
                    exclude: ['app'],
//                    optimize: 'none'  
                }
            },
            devAge: {
                options: {
                    baseUrl: ".",
                    mainConfigFile: "main.js",
                    out: "./dist/agencyModule.min.js",
                    name: './agency_module/agencyModule',
                    //include: ['./main'],
                    exclude: ['app'],
//                    optimize: 'none'
                }
            },
            devAdm: {
                options: {
                    baseUrl: ".",
                    mainConfigFile: "main.js",
                    out: "./dist/adminModule.min.js",
                    name: './admin_module/adminModule',
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
            case 2: return ['requirejs:devStu'];
            case 3: return ['requirejs:devApp', 'requirejs:devStu', 'requirejs:devAge'];
        }
    }

    grunt.registerTask('default',dev(1));
    //grunt.registerTask('release',['requirejs:release','express:dev','express-keepalive']);
}
