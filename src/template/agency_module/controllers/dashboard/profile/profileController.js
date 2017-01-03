/**
 * Created by trananhgien on 5/16/2016.
 */

define([

], function () {

  function profileCtrl(vm, user, utils, toaster, $q, $timeout) {
    vm.password = {
      currpwd: "",
      newpwd: ""
    };
    vm.companySizes = ["Startup 1-10", "Small 11-50", "Medium 51-150", "Big 151-300", "Huge 300+"];
    vm.companyTypes = ["Outsourcing", "Product"];
    vm.profile = {tech_stack: []};
    vm.locations = [];
    vm.loc = {};
    vm.uploadFiles = {};
    vm.gallerySrc = [];
    vm.gallerySrcDelete = [];
    vm.logoSrc = "";
    vm.filterTag = filterTag;
    vm.options = {
      height: 200,
      toolbar: [
        ['style', ['style', 'bold', 'italic', 'clear']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['height', ['height']]
      ]
    };

    var tags = [];

    var req = utils.Request.create(true);
    req.addRequest(utils.getLocations());
    req.addRequest(utils.getTags());
    req.addRequest(user.getAgency());


    req.all().then(function (res) {
      if (res.error) {
        return toaster.pop("error", "ERR " + res.error);
      }

      vm.locations = res[0];
      tags = res[1];

      vm.account = res[2].account;
      delete res[2].account;

      for (var property in res[2]) {
        if (res[2].hasOwnProperty(property) && property !== "tech_stack") {
          vm.profile[property] = res[2][property];
        }
      }

      vm.profile.tech_stack = JSON.parse(res[2].tech_stack);
      vm.logoSrc = vm.profile.url_logo;
      vm.gallerySrc = vm.profile.url_thumbs || vm.profile.url_imgs;
      console.log("logo-src", vm.logoSrc);
      initLocation(vm.profile.location);
      initCompanySize(vm.profile.company_size);
      initCompanyType(vm.profile.company_type);
    });

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
      console.log("tag-->", tag, tags);
      if (!tag || !tag.length)
        return tags;
      var result = [];
      for (var i = 0; i < tags.length; i++) {
        if (tags[i].toLowerCase().indexOf(tag.toLowerCase()) > -1) {
          result.push(tags[i]);
        }
      }

      return result;
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
      vm.gallerySrc.splice(index, 1);
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
      vm.savePromise = user.updateProfile(data)
        .then(function(res) {
          res = res.data;
          if (res.success !== 0) {
            return toaster.pop('error', utils.getError(res.success).error);
          }
          
          toaster.pop('success', "Update Profile Successfully");
        });
      
    }
    
    vm.saveAccount = function() {
      if (vm.password.newpwd !== vm.password.renewpwd) {
        return toaster.pop('error', "Retype password mismatch new password");
      }
      vm.isSaving = true;
      user.changePassword(vm.password.currpwd, vm.password.newpwd)
              .then(function(res) {
                vm.isSaving = false;

                res = res.data;
                if (res.success !== 0) {
                  return toaster.pop('error', 'Change password failed');
                }
                
                toaster.pop('success', 'Change password successfully');
              });
    };
  }

  profileCtrl.$inject = ["$scope", "user", "utils", "toaster", "$q", "$timeout"];

  return profileCtrl;

});