/**
 * Created by trananhgien on 7/1/2016.
 */

module.exports = function (grunt) {
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
//                    optimize: 'none'
        }
      }
    },
    concat: {
      libs: {
        src: [ 
          "assets/css/summernote.css", 
          "assets/css/font-awesome.min.css",
          "assets/css/ngGallery.css",
          "assets/css/angular-datepicker.min.css",
          "assets/css/ngProgress.css",
          "assets/css/ng-table.css",
          "assets/css/angular-busy.css",
          "libs/themes/default/style.min.css",
          "assets/css/toaster.min.css",
          "bower_components/ladda/dist/ladda-themeless.min.css",
          "bower_components/ng-tags-input/ng-tags-input.min.css",
          "bower_components/fakeLoader/fakeLoader.css"          
        ],
        dest: 'dist/css/libs.css'
      }
    },
    cssmin: {
      target: {
        files: {
          'dist/css/libs.min.css': ['dist/css/libs.css'],
          'dist/css/style.min.css': ['assets/css/style.css']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  function dev(mode) {
    switch (mode) {
      case 1:
        return ['requirejs:devApp'];
      case 2:
        return ['requirejs:devStu'];
      case 3:
        return ['requirejs:devApp', 'requirejs:devStu', 'requirejs:devAge'];
    }
  }

  grunt.registerTask('default', dev(1));
  //grunt.registerTask('release',['requirejs:release','express:dev','express-keepalive']);
}
