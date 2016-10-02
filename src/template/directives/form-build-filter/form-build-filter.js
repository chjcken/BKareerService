/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*  
 * input: [{
     text: "Field",
     queryVar: "field",
     options: [
        {
          text: "Title",
          value: "title"
        },
        {
          text: "Title",
          value: "title"
        }
      ]
   }] 
 */
define(['app'], function(app) {
  
  function filterDirective() {
    var template = '<div class="row">'+
    '	<div class="col-xs-12 col-sm-3" ng-repeat="item in items">'+
    '     <div class="form-group">'+
    '       <label>{{item.text}}</label>'+
    '         <select ng-change="update()" ng-model="item.model" class="form-control" ng-options="opt.text for opt in item.options"></select>'+
    '     </div>'+
    '	</div>'+
    '</div>';
    
    return {
      restrict: "E",
      scope: {
        items: "=",
        bindModel: "=ngModel"
      },
      link: function(scope, attrs, ele) {
        var items = scope.items;
        var query = "";
        
        function update() {
          for (var i = 0; i < items.length; i++) {
            query += "&" + items[i].queryVar + "=" + items[i].model;
          }
          scope.bindModel = query.splice(0,1);
        }
        
        scope.update = update;
      }
    };
  }
  
});