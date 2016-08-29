/**
 * Created by trananhgien on 8/15/2016.
 */

define(['app'], function(app) {
  var totalLevels = 0;

  function getType(type) {
    var types = ['text', 'number', 'email', 'password', 'file', 'select'];
    return types[type];
  }

  function render(config, level) {
   level = level == undefined ? 0 : level;
   level = level > 3 ? 3 : level;

   totalLevels = level;
   var group = level > 1 ? 'group ' : '';

   var template = '<div class="' + group + 'box-level-' + level + '"><p class="box-title">' + config.name + '</p>';
   if (config.is_last) {
     for (var i = 0; i < config.data.length; i++) {
       template += renderObject(config.data[i]);
     }
   } else {
     for (var i = 0; i < config.data.length; i++) {
       template += render(config.data[i], level + 1);
     }
   }

   template += '</div>';

   return template;

  }

  function renderObject(obj) {
    var template = '<div class="form-group"><label>' + obj.name + '</label>';
    switch(getType(obj.type)) {
      case 'text': template += getInput('text',  obj.bind_model, obj.name);
      break;
    }

    template += '</div>';
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

  function getSelect(isSingle, options, bindModel, onChangeFn) {
    var template = '';
    if ( isSingle ) {
      template = '<select ng-model="' + bindModel + '" ng-change="' + onChangeFn + '" ng-options=" opt.name for opt in ' + options  + '"></select>';
    } else {

    }

    return template;
  }

  function editFormDirective($compile) {
    var open = "<div class='overview' ng-click='showEdit(true)' ng-mouseover='isShowEditBtn = true' ng-mouseleave='isShowEditBtn = false'><span ng-show='!show && isShowEditBtn' class='form-edit-btn'> <button class='btn btn-sm'><i class='glyphicon glyphicon-pencil'></i></button></span><div ng-transclude>";
    var close = "</div></div>";

    return {
      scope: {
          show: "=",
          sectionData: "="
      },
      restrict: "E",
      transclude: true,
      template: "<div class='overview' ng-click='showEdit(true)' ng-mouseover='isShowEditBtn = true' ng-mouseleave='isShowEditBtn = false'><span ng-show='!show && isShowEditBtn' class='form-edit-btn'> <button class='btn btn-sm'><i class='glyphicon glyphicon-pencil'></i></button></span><div ng-transclude></div></div>",
      link: function(scope, ele, attrs) {
        console.log("section", scope.sectionData);
        ele.html(renderAll(scope.sectionData)).show();
        $compile(ele.contents())(scope.$parent);
        ele.find(".box-level-2").addClass('col-sm-6 col-md-6');
        ele.find(".box-level-2").parent().wrapInner('<div class="clearfix"></div>');
        console.log("totalLevels", totalLevels);
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

  editFormDirective.$inject = ['$compile'];

  app.directive('editForm', editFormDirective);
  return editFormDirective;
})
