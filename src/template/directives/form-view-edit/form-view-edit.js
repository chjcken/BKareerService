/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app'], function(app) {

  function editFormDirective($compile, createModels) {
    var open = "<div class='overview' ng-click='showEdit(true)' ng-mouseover='isShowEditBtn = true' ng-mouseleave='isShowEditBtn = false'><span ng-show='!show && isShowEditBtn' class='form-edit-btn'> <button class='btn btn-sm'><i class='glyphicon glyphicon-pencil'></i></button></span><div ng-transclude>";
    var close = "</div></div>";
    var totalLevels = 0, enumValueTypes = createModels.enumValueTypes;

    function render(config, level) {
      level = level == undefined ? 0 : level;
      level = level > 3 ? 3 : level;

      totalLevels = level;
      var group = level > 1 ? 'group ' : '';

      var template = '';
      if (config.is_last) {
        template += renderObject(config);
      } else {
        template = '<div class="' + group + 'box-level-' + level + '"><p class="box-title">' + config.name + '</p>';
        for (var i = 0; i < config.data.length; i++) {
          template += render(config.data[i], level + 1);
        }

        template += '</div>';
      }


      return template;
    }

    function renderObject(obj) {
      var valueType = obj.data[0].value_type;
      // if is select
      var template = '<div class="form-group"><label>' + obj.name + '</label>';

      switch(valueType) {
        case enumValueTypes.TEXT:
        case enumValueTypes.NUMBER:
        case enumValueTypes.EMAIL:
          template += getInput(Object.keys(enumValueTypes)[valueType], obj.data[0].bind_model, obj.name);
          break;
        case enumValueTypes.RADIO:
          template += getSelect(obj.bind_options, obj.bind_model);
          break;
        case enumValueTypes.CHECKBOX:
          template += getMultiSelect(obj.bind_options, obj.bind_model);
          break;
        case enumValueTypes.LOCATION:
          obj = obj.data[0];
          template += getLocationSelect(obj.bind_model_attr_1, obj.bind_model_attr_2, obj.bind_options);
          break;
      }

      template += '</div>';
    //   console.log("renderObject", template);
      return template;
    }

    function renderAll(section) {
      return render(section);
    }

    function getInput(type, bindModel, placeholder) {
      placeholder = placeholder || '';
      var template = '<input class="form-control" ng-model="' + bindModel + '" type="' + type + '" placeholder="' + placeholder + '" />';
      return template;
    }

    function getSelect(options, bindModel, onChangeFn) {
      var template = '';
      template = '<select class="form-control" ng-model="' + bindModel + '" ng-change="' + 'onSelectChange()' + '" ng-options=" opt.name for opt in ' + options  + '"></select>';

      return template;
    }

    function getMultiSelect(bindOptions, bindModel) {
      return '<div ng-dropdown-multiselect="" options="'
      + bindOptions + '" ng-init="' + bindModel + '=[]" selected-model="' + bindModel
      + '" extra-settings="{smartButtonMaxItems: 3, displayProp: \'name\', enableSearch: true}"></div>';
    }

    function getLocationSelect(bind_selectedCity, bind_selectedDist, bindOptions) {
      var templateCity = '<select class="form-control" ng-model="' + bind_selectedCity + '" ng-change="' + bind_selectedDist + '='
      + bind_selectedCity + '.' + 'districts[0]" ng-options="city.name for city in ' + bindOptions + '"></select>';
     
      var templateDist = '<select class="form-control" ng-model="' + bind_selectedDist + '" ng-options="dist.name for dist in ' 
       + bind_selectedCity + '.districts' + '"></select>';
      
      return templateCity + templateDist;
    }
    
    
    
    return {
      scope: {
          show: "=",
          sectionData: "="
      },
      restrict: "E",
      transclude: true,
      template: "<div class='overview' ng-click='showEdit(true)' ng-mouseover='isShowEditBtn = true' ng-mouseleave='isShowEditBtn = false'><span ng-show='!show && isShowEditBtn' class='form-edit-btn'> <button class='btn btn-sm'><i class='glyphicon glyphicon-pencil'></i></button></span><div ng-transclude></div></div>",
      link: function(scope, ele, attrs) {
        var template = renderAll(scope.sectionData);
        ele.html(template).show();
        $compile(ele.contents())(scope.$parent);
        ele.find(".box-level-2").addClass('col-sm-6 col-md-6');
        ele.find(".box-level-2").parent().wrapInner('<div class="clearfix"></div>');
        scope.$watch('show', function(newVal, oldVal) {
            show(newVal);
        });
        function show(param) {
            if (param) {
                ele.find(".view-field").hide();
                ele.find(".edit-field").show();
                ele.unbind("click");
            } else {
                ele.find(".view-field").show();
                ele.find(".edit-field").hide();
            }
        }

        scope.showEdit = function() {
            scope.show = true;
        }

      }
    }
  
  }

  editFormDirective.$inject = ['$compile', 'criteria'];

  app.directive('editForm', editFormDirective);
  return editFormDirective;
})
