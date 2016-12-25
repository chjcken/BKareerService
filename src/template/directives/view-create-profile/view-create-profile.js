define([
], function() {

  function agencyProfileDirective() {
    return {
      scope: {
        tags: "=",
        locations: "=",
        companyTypes: "=",
        companySizes: "=",
        profile: "=",
        onSubmit: "&"
      },
      controller: ['$scope', function($scope) {
        $scope.options = {
                height: 200,
                toolbar: [
                    ['style', ['style','bold', 'italic', 'clear']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['height', ['height']]
                ]
            };
      }],
      restrict: "E",
      templateUrl: 'directives/view-create-profile/view-create-profile.html',

      link: function(vm, ele, attrs) {
//        var tags = vm.tags;
        console.log("taggggg", vm.tags);
        vm.loc = {};
        vm.uploadFiles = {};
        vm.gallerySrc = [];
        vm.gallerySrcDelete = [];
        vm.logoSrc = "";
        vm.filterTag = filterTag;


        function initLocation(location) {
          var parts = location.split(",");
          var cityName, districtName;
          for (var i = 0; i < parts.length; i++) {
            parts[i].trim();
          }

          if (parts.length === 3) {
            vm.loc.address = parts[0];
            parts.shift();
          }

          cityName = parts[1];
          districtName = parts[0];

          if (parts.length === 1) {
            cityName = parts[0];
            districtName = "";
          }

          // map to array location
          for (var i = 0; i < vm.locations.length; i++) {
            var city = vm.locations[i];
            if (city.name.toLowerCase() === cityName.toLowerCase()) {
              vm.loc.city = city;
              for (var j = 0; j < city.districts.length; j++) {
                var district = city.districts[j];
                if (district.name.toLowerCase() === districtName.toLowerCase()) {
                  vm.loc.district = district;
                }
              }
            }
          }

          if (!vm.loc.city) {
            vm.loc.city = vm.locations[0];
          }

          vm.loc.district = vm.loc.city.districts[0];

        }

        function initCompanySize(size) {
          for (var i = 0; i < vm.companySizes; i++) {
            if (vm.companySizes[i].toLowerCase() === size.toLowerCase()) {
              vm.profile.company_size = vm.companySizes[i];
            }
          }
        }

        function initCompanyType(type) {
          for (var i = 0; i < vm.companyTypes; i++) {
            if (vm.companyTypes[i].toLowerCase() === type.toLowerCase()) {
              vm.profile.company_type = vm.companyTypes[i];
            }
          }

        }

        function filterTag(tag) {
          if (!tag || !tag.length)
            return vm.tags;
          var result = [];
          for (var i = 0; i < vm.tags.length; i++) {
            if (vm.tags[i].toLowerCase().indexOf(tag.toLowerCase()) > -1) {
              result.push(vm.tags[i]);
            }
          }

          return result;
        }

        function init() {
          console.log("tech_stack", vm.profile);
          vm.profile.tech_stack = JSON.parse(vm.profile.tech_stack);
          vm.logoSrc = vm.profile.url_logo;
          vm.gallerySrc = vm.profile.url_thumbs || vm.profile.url_imgs;
          console.log("logo-src", vm.logoSrc);
          initLocation(vm.profile.location);
          initCompanySize(vm.profile.company_size);
          initCompanyType(vm.profile.company_type);
        }

        vm.showPhoto = function(file) {
          var reader = new FileReader();
            reader.onload = function(event) {
              vm.$apply(function() {
                vm.logoSrc = event.target.result;
              });

            };

          reader.readAsDataURL(file);
        };

        vm.showGallery = function(files) {
          vm.gallerySrc = [];
          for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var reader = new FileReader();
            reader.onload = handler;
            reader.readAsDataURL(file);
          }

          function handler (event) {
            vm.$apply(function() {
              vm.gallerySrc.push(event.target.result);
            });


          }

        }

        vm.deleteGallery = function(src) {
          var index = vm.gallerySrc.indexOf(src);
          vm.splice(index, 1);
          vm.gallerySrcDelete.push(src);
        };

        vm.save = function() {
          var locationText = '';
          console.log(vm.loc);
          if (vm.loc.address) {
            locationText += vm.loc.address;
          }

          if (vm.loc.district) {
            locationText += ', ' + vm.loc.district.name;
          }

          if (vm.loc.city) {
            locationText += ', ' + vm.loc.city.name;
          }


          vm.profile.location = locationText;
          var data = {};
          for (var prop in vm.profile) {
            if (vm.profile.hasOwnProperty(prop)) {
              data[prop] = vm.profile[prop];
            }
          }

          data.tech_stack = [];
    //      angular.copy(data, vm.profile);
          angular.forEach(vm.profile.tech_stack, function(tag) {
            data.tech_stack.push(tag.text);
          });
          delete data.url_logo;
          delete data.url_imgs;
          console.log("tech", data.tech_stack, JSON.stringify(data.tech_stack));
          data.tech_stack = JSON.stringify(data.tech_stack);
          if (vm.uploadFiles.logoFile) {
            data.file_logo = vm.uploadFiles.logoFile;
          }

          console.log("filename", vm.uploadFiles);
          angular.forEach(vm.uploadFiles.galleryFile, function(f, i) {
            data["file" + (i+1)] = f;
          });

          if (vm.gallerySrcDelete.length) {
            data.url_imgs_delete = JSON.stringify(vm.gallerySrcDelete);
          }

          console.log("--profile--", data);
          vm.onSubmit({profile: data});
        }


        vm.$watch('locations', function(value) {
          if (value && value.length > 0) {
            vm.loc.city = value[0];
            vm.loc.district = vm.loc.city.districts[0];
          }
        });

        vm.$watch('profile', function(value) {
          if (!value) return;
          init();
        });
      }
    }
  }

  return agencyProfileDirective;
});
